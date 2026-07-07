import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const SECRET = process.env.APP_SECRET || "dev-secret-change-me";

/** HMAC-signed stateless token: `${userId}.${sig}`. */
export function signToken(userId: number): string {
  const sig = crypto.createHmac("sha256", SECRET).update(String(userId)).digest("hex");
  return `${userId}.${sig}`;
}

export function verifyToken(token: string): number | null {
  const [id, sig] = String(token || "").split(".");
  if (!id || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(id).digest("hex");
  try { if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return Number(id); } catch { /* ignore */ }
  return null;
}

/** Attaches req.userId from the Authorization: Bearer <token> (or x-auth-token) header. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const raw = String(req.headers["authorization"] ?? "").replace(/^Bearer\s+/i, "") || String(req.headers["x-auth-token"] ?? "");
  const id = verifyToken(raw);
  if (!id) return res.status(401).json({ error: "Please log in." });
  (req as Request & { userId?: number }).userId = id;
  next();
}

export const userOf = (req: Request) => (req as Request & { userId?: number }).userId!;
