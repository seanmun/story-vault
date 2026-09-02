import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { createClient } from "@/lib/supabase/server";
import type { processRecording } from "@/trigger/pipeline";

const MAX_DURATION_SECONDS = 660; // 10-minute client cap plus buffer
const MAX_FILE_SIZE_BYTES = 52428800; // matches the bucket limit
const MAX_RECORDINGS_PER_DAY = 50; // generous for real use, bounds abuse
const ALLOWED_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
];

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storagePath, durationSeconds, mimeType } = await request.json();

  // The path must live inside the caller's own folder — everything downstream
  // (transcription, voice clone, deletion) trusts this prefix.
  if (
    typeof storagePath !== "string" ||
    !storagePath.startsWith(`${user.id}/`) ||
    storagePath.includes("..") ||
    storagePath.length > 255
  ) {
    return NextResponse.json({ error: "Invalid storagePath" }, { status: 400 });
  }

  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration < 0 || duration > MAX_DURATION_SECONDS) {
    return NextResponse.json({ error: "Invalid durationSeconds" }, { status: 400 });
  }

  const baseMimeType = typeof mimeType === "string" ? mimeType.split(";")[0].trim() : "";
  if (!ALLOWED_MIME_TYPES.includes(baseMimeType)) {
    return NextResponse.json({ error: "Invalid mimeType" }, { status: 400 });
  }

  // Every recording triggers paid transcription + LLM calls downstream —
  // bound the daily volume per account.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("recordings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", dayAgo);

  if ((recentCount ?? 0) >= MAX_RECORDINGS_PER_DAY) {
    return NextResponse.json(
      { error: "Daily recording limit reached. Try again tomorrow." },
      { status: 429 }
    );
  }

  // Verify the object actually exists and take its size from storage rather
  // than trusting the client's number.
  const lastSlash = storagePath.lastIndexOf("/");
  const folder = storagePath.slice(0, lastSlash);
  const baseName = storagePath.slice(lastSlash + 1);
  const { data: objects, error: listError } = await supabase.storage
    .from("recordings")
    .list(folder, { search: baseName, limit: 1 });

  const object = objects?.find((o) => o.name === baseName);
  if (listError || !object) {
    return NextResponse.json(
      { error: "Uploaded file not found in storage" },
      { status: 400 }
    );
  }

  const fileSizeBytes =
    typeof object.metadata?.size === "number" ? object.metadata.size : 0;
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const { data: recording, error: dbError } = await supabase
    .from("recordings")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      duration_seconds: Math.round(duration),
      file_size_bytes: fileSizeBytes,
      mime_type: baseMimeType,
      status: "uploaded",
    })
    .select("id")
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }

  // Queue the durable pipeline (transcribe → story) only when explicitly
  // enabled — a queued run in a misconfigured environment reports success and
  // then silently does nothing, which is worse than the client-driven
  // fallback chain. Flip PIPELINE_ENABLED=true in Vercel once the pipeline's
  // Supabase service key is verified working.
  let queued = false;
  if (process.env.PIPELINE_ENABLED === "true") {
    try {
      await tasks.trigger<typeof processRecording>("process-recording", {
        recordingId: recording.id,
      });
      queued = true;
    } catch (err) {
      console.error("Failed to queue process-recording", err);
    }
  }

  return NextResponse.json({
    id: recording.id,
    storagePath,
    status: "uploaded",
    queued,
  });
}
