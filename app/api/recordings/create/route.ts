import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_DURATION_SECONDS = 660; // 10-minute client cap plus buffer
const MAX_FILE_SIZE_BYTES = 52428800; // matches the bucket limit
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

  return NextResponse.json({
    id: recording.id,
    storagePath,
    status: "uploaded",
  });
}
