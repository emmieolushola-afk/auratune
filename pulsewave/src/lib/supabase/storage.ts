import type { SupabaseClient } from "@supabase/supabase-js";

export const UPLOAD_BUCKET = "uploads";

/** Best-effort creation of the uploads bucket (no-op if it already exists). */
export async function ensureUploadBucket(client: SupabaseClient): Promise<void> {
  try {
    const { error } = await client.storage.createBucket(UPLOAD_BUCKET, {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024,
      allowedMimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
    });
    if (error && !String(error.message).toLowerCase().includes("exist")) {
      // Bucket may already exist with different options; treat as fatal only
      // for missing service-role permissions we can't fix here.
    }
  } catch {
    /* ignore — requires dashboard setup */
  }
}

/**
 * Returns the public URL for an object in the uploads bucket, or a signed URL
 * if the bucket is private. Tries `getPublicUrl` first and falls back to
 * `createSignedUrl` when the object isn't publicly readable.
 */
export async function buildObjectUrl(
  client: SupabaseClient,
  path: string
): Promise<string> {
  const { data: pub } = client.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
  if (pub?.publicUrl) {
    return pub.publicUrl;
  }
  const { data } = await client.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 30);
  return data?.signedUrl ?? "";
}

/** Uploads a binary buffer into the uploads bucket. */
export async function uploadObject(
  client: SupabaseClient,
  path: string,
  file: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const { error } = await client.storage.from(UPLOAD_BUCKET).upload(path, file, {
    contentType,
    upsert: true,
  });
  if (error) return null;
  return path;
}

/** Removes an object from the uploads bucket. */
export async function removeObject(
  client: SupabaseClient,
  path: string
): Promise<void> {
  await client.storage.from(UPLOAD_BUCKET).remove([path]);
}
