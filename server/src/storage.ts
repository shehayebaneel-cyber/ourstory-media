import crypto from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 is S3-compatible. Uploads go direct from the browser via a
// presigned PUT URL, so large photos/videos never pass through the server.
export const r2Configured = () =>
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/** Returns a short-lived upload URL + the final public URL for a new object. */
export async function presignUpload(contentType: string, ext: string) {
  if (!r2Configured()) return null;
  const day = new Date().toISOString().slice(0, 10);
  const key = `${day}/${crypto.randomUUID()}${ext.startsWith(".") ? ext : ext ? "." + ext : ""}`;
  const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client(), cmd, { expiresIn: 600 });
  const publicUrl = `${(process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")}/${key}`;
  return { uploadUrl, key, publicUrl };
}
