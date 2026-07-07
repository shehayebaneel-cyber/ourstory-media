import { api } from "./api.ts";
import type { Media } from "../types.ts";

/** Upload a file straight to Cloudflare R2 via a presigned URL and return its media ref. */
export async function uploadFile(file: File): Promise<Media> {
  const ext = "." + (file.name.split(".").pop() ?? "bin").toLowerCase();
  const presign = await api.post<{ uploadUrl: string; key: string; publicUrl: string }>("/api/media/upload-url", { contentType: file.type, ext });
  const put = await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new Error("Upload failed.");
  const type = file.type.startsWith("video") ? "VIDEO" : "IMAGE";
  await api.post("/api/media", { key: presign.key, url: presign.publicUrl, type });
  return { url: presign.publicUrl, type };
}
