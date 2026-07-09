import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { signToken, requireAuth, userOf } from "./auth";
import { presignUpload, r2Configured } from "./storage";

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "4mb" }));

const STR = (v: unknown, max = 2000) => String(v ?? "").trim().slice(0, max);
const NUM = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const parseArr = (s: string) => { try { const a = JSON.parse(s); return Array.isArray(a) ? a : []; } catch { return []; } };
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const getSetting = async (key: string, def = "") => (await prisma.setting.findUnique({ where: { key } }))?.value ?? def;
const setSetting = (key: string, value: string) => prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });

const QUOTES = [
  "Every love story is beautiful, but ours is my favorite.",
  "In you, I've found the love of my life and my closest friend.",
  "I love you not only for what you are, but for what I am when I'm with you.",
  "You are my today and all of my tomorrows.",
  "Whatever our souls are made of, yours and mine are the same.",
  "I still fall for you every single day.",
  "Home is wherever I'm with you.",
  "You're my favorite notification.",
];

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- Auth ----
app.post("/api/auth/login", async (req, res) => {
  const email = STR(req.body?.email, 160).toLowerCase(), password = String(req.body?.password ?? "");
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return res.status(401).json({ error: "Wrong email or password." });
  res.json({ token: signToken(u.id), user: { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl } });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: userOf(req) } });
  if (!u) return res.status(404).json({ error: "Not found." });
  res.json({ id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl });
});
app.patch("/api/me", requireAuth, async (req, res) => {
  const data: Record<string, unknown> = {};
  if (req.body?.name !== undefined) data.name = STR(req.body.name, 60);
  if (req.body?.avatarUrl !== undefined) data.avatarUrl = STR(req.body.avatarUrl, 600);
  const u = await prisma.user.update({ where: { id: userOf(req) }, data });
  res.json({ id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl });
});
app.post("/api/me/password", requireAuth, async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: userOf(req) } });
  if (!u || !(await bcrypt.compare(String(req.body?.current ?? ""), u.passwordHash))) return res.status(400).json({ error: "Current password is incorrect." });
  const next = String(req.body?.password ?? "");
  if (next.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  res.json({ ok: true });
});

// ---- Settings (relationship start date, names, etc.) ----
app.get("/api/settings", requireAuth, async (_req, res) => {
  const rows = await prisma.setting.findMany();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
app.patch("/api/settings", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  for (const [k, v] of Object.entries(b)) await setSetting(STR(k, 40), STR(v, 2000));
  res.json({ ok: true });
});

// ---- Home dashboard ----
const firstMedia = (rows: { media: string }[]) => rows.flatMap((r) => parseArr(r.media)).filter((m: { url?: string }) => m?.url);
app.get("/api/home", requireAuth, async (_req, res) => {
  const now = new Date();
  const todayMMDD = now.toISOString().slice(5, 10);
  const startDate = await getSetting("startDate", "2020-01-01");
  const start = new Date(startDate + "T00:00:00");
  const daysTogether = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
  // next anniversary of the start date
  const nextAnn = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (nextAnn < now) nextAnn.setFullYear(now.getFullYear() + 1);
  const daysToAnniversary = Math.ceil((nextAnn.getTime() - now.getTime()) / 86400000);

  const [users, memories, upcoming] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, avatarUrl: true } }),
    prisma.memory.findMany({ where: { OR: [{ unlockAt: null }, { unlockAt: { lte: now } }] }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] }),
    prisma.milestone.findMany({ where: { date: { gte: now.toISOString().slice(0, 10) } }, orderBy: { date: "asc" }, take: 1 }),
  ]);
  const onThisDay = memories.filter((m) => m.date.slice(5, 10) === todayMMDD && m.date.slice(0, 4) < String(now.getFullYear()));
  const photos = firstMedia(memories);
  const featured = photos.length ? photos[Math.floor((now.getTime() / 86400000) % photos.length)] : null;
  const quote = QUOTES[Math.floor(now.getTime() / 86400000) % QUOTES.length];

  res.json({
    users, startDate, daysTogether,
    yearsTogether: Math.floor(daysTogether / 365.25),
    monthsTogether: Math.floor(daysTogether / 30.44),
    nextAnniversary: { date: nextAnn.toISOString().slice(0, 10), inDays: daysToAnniversary, year: now.getFullYear() - start.getFullYear() + (nextAnn.getFullYear() > now.getFullYear() ? 1 : 0) },
    latest: memories[0] ? shapeMemory(memories[0]) : null,
    onThisDay: onThisDay.map(shapeMemory),
    upcomingMilestone: upcoming[0] ?? null,
    featuredPhoto: featured,
    quote,
    stats: { memories: memories.length, photos: photos.filter((m: { type?: string }) => m.type !== "VIDEO").length, videos: photos.filter((m: { type?: string }) => m.type === "VIDEO").length },
  });
});

// ---- Timeline milestones ----
app.get("/api/milestones", requireAuth, async (_req, res) => {
  res.json((await prisma.milestone.findMany({ orderBy: { date: "asc" } })).map((m) => ({ ...m, tags: parseArr(m.tags), media: parseArr(m.media) })));
});
app.post("/api/milestones", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  if (!STR(b.title) || !isDate(STR(b.date, 10))) return res.status(400).json({ error: "Title and a valid date are required." });
  res.status(201).json(await prisma.milestone.create({ data: milestoneData(b) }));
});
app.patch("/api/milestones/:id", requireAuth, async (req, res) => {
  res.json(await prisma.milestone.update({ where: { id: STR(req.params.id, 40) }, data: milestoneData(req.body ?? {}) }));
});
app.delete("/api/milestones/:id", requireAuth, async (req, res) => { await prisma.milestone.delete({ where: { id: STR(req.params.id, 40) } }).catch(() => {}); res.json({ ok: true }); });
function milestoneData(b: Record<string, unknown>) {
  return {
    title: STR(b.title, 160), date: STR(b.date, 10), description: STR(b.description, 4000), location: STR(b.location, 160),
    tags: JSON.stringify(Array.isArray(b.tags) ? b.tags.map((t: unknown) => STR(t, 30)).filter(Boolean) : []),
    media: JSON.stringify(Array.isArray(b.media) ? b.media : []),
  };
}

// ---- Memories (daily journal) ----
function shapeMemory<T extends { media: string; reactions: string; tags: string }>(m: T) {
  return { ...m, media: parseArr(m.media), reactions: parseArr(m.reactions), tags: parseArr(m.tags) };
}
app.get("/api/memories", requireAuth, async (req, res) => {
  const now = new Date();
  const items = await prisma.memory.findMany({ where: { OR: [{ unlockAt: null }, { unlockAt: { lte: now } }] }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 500 });
  res.json(items.map(shapeMemory));
});
app.get("/api/memories/random", requireAuth, async (_req, res) => {
  const now = new Date();
  const ids = await prisma.memory.findMany({ where: { OR: [{ unlockAt: null }, { unlockAt: { lte: now } }] }, select: { id: true } });
  if (!ids.length) return res.json(null);
  const pick = ids[Math.floor(Math.random() * ids.length)].id;
  const m = await prisma.memory.findUnique({ where: { id: pick } });
  res.json(m ? shapeMemory(m) : null);
});
app.get("/api/memories/:id", requireAuth, async (req, res) => {
  const m = await prisma.memory.findUnique({ where: { id: STR(req.params.id, 40) } });
  if (!m) return res.status(404).json({ error: "Not found." });
  res.json(shapeMemory(m));
});
app.post("/api/memories", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  if (!STR(b.title) || !isDate(STR(b.date, 10))) return res.status(400).json({ error: "Title and a valid date are required." });
  res.status(201).json(shapeMemory(await prisma.memory.create({ data: { ...(await withGeocode(b)), authorId: userOf(req) } as Prisma.MemoryUncheckedCreateInput })));
});
app.patch("/api/memories/:id", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  const existing = await prisma.memory.findUnique({ where: { id: STR(req.params.id, 40) }, select: { location: true, lat: true, lng: true } });
  res.json(shapeMemory(await prisma.memory.update({ where: { id: STR(req.params.id, 40) }, data: (await withGeocode(b, existing ?? undefined)) as Prisma.MemoryUncheckedUpdateInput })));
});
app.delete("/api/memories/:id", requireAuth, async (req, res) => { await prisma.memory.delete({ where: { id: STR(req.params.id, 40) } }).catch(() => {}); res.json({ ok: true }); });
app.post("/api/memories/:id/react", requireAuth, async (req, res) => {
  const m = await prisma.memory.findUnique({ where: { id: STR(req.params.id, 40) } });
  if (!m) return res.status(404).json({ error: "Not found." });
  const reactions = parseArr(m.reactions).filter((r: { by: number }) => r.by !== userOf(req));
  const emoji = STR(req.body?.emoji, 8);
  if (emoji) reactions.push({ by: userOf(req), emoji });
  res.json(shapeMemory(await prisma.memory.update({ where: { id: m.id }, data: { reactions: JSON.stringify(reactions) } })));
});
function memoryData(b: Record<string, unknown>) {
  const d: Record<string, unknown> = {};
  const s = (k: string, max = 4000) => { if (b[k] !== undefined) d[k] = STR(b[k], max); };
  ["title", "date", "time", "location", "mood", "weather", "story", "favoriteMoment", "funnyMoment", "food", "songs", "insideJokes", "notesA", "notesB"].forEach((k) => s(k));
  if (b.date !== undefined) d.date = STR(b.date, 10);
  if (b.rating !== undefined) d.rating = Math.max(0, Math.min(10, Math.round(NUM(b.rating))));
  if (b.lat !== undefined) d.lat = b.lat === null ? null : NUM(b.lat);
  if (b.lng !== undefined) d.lng = b.lng === null ? null : NUM(b.lng);
  if (b.isFavorite !== undefined) d.isFavorite = !!b.isFavorite;
  if (b.unlockAt !== undefined) d.unlockAt = b.unlockAt ? new Date(String(b.unlockAt)) : null;
  if (b.media !== undefined) d.media = JSON.stringify(Array.isArray(b.media) ? b.media : []);
  if (b.tags !== undefined) d.tags = JSON.stringify(Array.isArray(b.tags) ? b.tags.map((t: unknown) => STR(t, 30)).filter(Boolean) : []);
  return d;
}

// Free best-effort geocoding (OpenStreetMap Nominatim) so a typed location gets pinned on the map.
async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  if (!q.trim()) return null;
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { "User-Agent": "OurStory/1.0 (private couple app)" } });
    const arr = (await r.json()) as { lat: string; lon: string }[];
    if (Array.isArray(arr) && arr[0]) return { lat: Number(arr[0].lat), lng: Number(arr[0].lon) };
  } catch { /* ignore — pin is optional */ }
  return null;
}
async function withGeocode(b: Record<string, unknown>, existing?: { location: string; lat: number | null; lng: number | null }) {
  const d = memoryData(b);
  const loc = d.location as string | undefined;
  const explicit = b.lat !== undefined || b.lng !== undefined;
  if (loc && !explicit && loc !== existing?.location) {
    const g = await geocode(loc);
    if (g) { d.lat = g.lat; d.lng = g.lng; }
  }
  return d;
}

// ---- Media uploads (direct-to-R2 via presigned URL) ----
app.post("/api/media/upload-url", requireAuth, async (req, res) => {
  if (!r2Configured()) return res.status(503).json({ error: "Media storage isn't connected yet." });
  const contentType = STR(req.body?.contentType, 100) || "application/octet-stream";
  const ext = STR(req.body?.ext, 10);
  const out = await presignUpload(contentType, ext);
  if (!out) return res.status(503).json({ error: "Media storage isn't connected yet." });
  res.json(out);
});
app.post("/api/media", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  const key = STR(b.key, 300), url = STR(b.url, 600);
  if (!key || !url) return res.status(400).json({ error: "Missing media." });
  const asset = await prisma.mediaAsset.upsert({ where: { key }, create: { key, url, type: STR(b.type, 10).toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE", width: NUM(b.width), height: NUM(b.height) }, update: {} });
  res.json(asset);
});

// ---- Bucket list ----
app.get("/api/bucket", requireAuth, async (_req, res) => res.json(await prisma.bucketItem.findMany({ orderBy: [{ done: "asc" }, { createdAt: "desc" }] })));
app.post("/api/bucket", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  if (!STR(b.title, 200)) return res.status(400).json({ error: "Add a title." });
  res.json(await prisma.bucketItem.create({ data: { title: STR(b.title, 200), category: STR(b.category, 40), notes: STR(b.notes, 1000) } }));
});
app.patch("/api/bucket/:id", requireAuth, async (req, res) => {
  const b = req.body ?? {}; const data: Record<string, unknown> = {};
  if (b.title !== undefined) data.title = STR(b.title, 200);
  if (b.category !== undefined) data.category = STR(b.category, 40);
  if (b.notes !== undefined) data.notes = STR(b.notes, 1000);
  if (b.done !== undefined) { data.done = !!b.done; data.doneAt = b.done ? new Date() : null; }
  res.json(await prisma.bucketItem.update({ where: { id: STR(req.params.id, 40) }, data }));
});
app.delete("/api/bucket/:id", requireAuth, async (req, res) => { await prisma.bucketItem.delete({ where: { id: STR(req.params.id, 40) } }).catch(() => {}); res.json({ ok: true }); });

// ---- Love letters (can be sealed until an unlock date) ----
app.get("/api/letters", requireAuth, async (_req, res) => {
  const now = new Date();
  res.json((await prisma.letter.findMany({ orderBy: { createdAt: "desc" } })).map((l) => {
    const sealed = !!(l.unlockAt && l.unlockAt > now);
    return sealed
      ? { id: l.id, fromName: l.fromName, toName: l.toName, title: l.title, body: "", sealed: true, unlockAt: l.unlockAt, readAt: l.readAt, createdAt: l.createdAt }
      : { ...l, sealed: false };
  }));
});
app.post("/api/letters", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  if (!STR(b.body, 20000)) return res.status(400).json({ error: "Write your letter first." });
  const me = await prisma.user.findUnique({ where: { id: userOf(req) } });
  res.json(await prisma.letter.create({ data: {
    fromName: STR(b.fromName, 60) || me?.name || "Me", toName: STR(b.toName, 60),
    title: STR(b.title, 160), body: STR(b.body, 20000),
    unlockAt: isDate(String(b.unlockAt)) ? new Date(String(b.unlockAt) + "T00:00:00") : null,
  } }));
});
app.patch("/api/letters/:id", requireAuth, async (req, res) => {
  const data: Record<string, unknown> = {};
  if (req.body?.read) data.readAt = new Date();
  res.json(await prisma.letter.update({ where: { id: STR(req.params.id, 40) }, data }));
});
app.delete("/api/letters/:id", requireAuth, async (req, res) => { await prisma.letter.delete({ where: { id: STR(req.params.id, 40) } }).catch(() => {}); res.json({ ok: true }); });

// ---- Countdowns ----
app.get("/api/countdowns", requireAuth, async (_req, res) => res.json(await prisma.countdown.findMany({ orderBy: { date: "asc" } })));
app.post("/api/countdowns", requireAuth, async (req, res) => {
  const b = req.body ?? {};
  if (!isDate(String(b.date))) return res.status(400).json({ error: "Pick a date." });
  if (!STR(b.title, 160)) return res.status(400).json({ error: "Add a title." });
  res.json(await prisma.countdown.create({ data: { title: STR(b.title, 160), date: STR(b.date, 10), emoji: STR(b.emoji, 8) || "🎉" } }));
});
app.delete("/api/countdowns/:id", requireAuth, async (req, res) => { await prisma.countdown.delete({ where: { id: STR(req.params.id, 40) } }).catch(() => {}); res.json({ ok: true }); });

// ---- Gallery (every photo/video across memories + milestones) ----
app.get("/api/gallery", requireAuth, async (_req, res) => {
  const [memories, milestones] = await Promise.all([
    prisma.memory.findMany({ where: { OR: [{ unlockAt: null }, { unlockAt: { lte: new Date() } }] }, orderBy: { date: "desc" }, select: { id: true, title: true, date: true, media: true } }),
    prisma.milestone.findMany({ orderBy: { date: "desc" }, select: { id: true, title: true, date: true, media: true } }),
  ]);
  const out: { url: string; type?: string; source: string; refId: string; title: string; date: string }[] = [];
  for (const m of memories) for (const x of parseArr(m.media) as { url: string; type?: string }[]) if (x?.url) out.push({ ...x, source: "memory", refId: m.id, title: m.title, date: m.date });
  for (const m of milestones) for (const x of parseArr(m.media) as { url: string; type?: string }[]) if (x?.url) out.push({ ...x, source: "milestone", refId: m.id, title: m.title, date: m.date });
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json(out);
});

// ---- Favorites (starred memories) ----
app.get("/api/favorites", requireAuth, async (_req, res) => res.json((await prisma.memory.findMany({ where: { isFavorite: true }, orderBy: { date: "desc" } })).map(shapeMemory)));

// ---- Places (memory locations for the map) ----
app.get("/api/places", requireAuth, async (_req, res) => {
  const mems = await prisma.memory.findMany({
    where: { lat: { not: null }, lng: { not: null }, OR: [{ unlockAt: null }, { unlockAt: { lte: new Date() } }] },
    orderBy: { date: "desc" }, select: { id: true, title: true, date: true, location: true, lat: true, lng: true, media: true },
  });
  res.json(mems.map((m) => ({ id: m.id, title: m.title, date: m.date, location: m.location, lat: m.lat, lng: m.lng, photo: ((parseArr(m.media)[0] as { url?: string }) || {}).url || "" })));
});

const port = Number(process.env.PORT) || 4400;
app.listen(port, () => console.log(`OurStory API on http://localhost:${port} · R2 ${r2Configured() ? "connected" : "NOT configured"}`));
