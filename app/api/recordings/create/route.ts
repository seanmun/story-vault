import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storagePath, durationSeconds, fileSizeBytes, mimeType } =
    await request.json();

  if (!storagePath) {
    return NextResponse.json(
      { error: "Missing storagePath" },
      { status: 400 }
    );
  }

  // Create recording record in database
  const { data: recording, error: dbError } = await supabase
    .from("recordings")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      duration_seconds: durationSeconds || 0,
      file_size_bytes: fileSizeBytes || 0,
      mime_type: mimeType || "audio/webm",
      status: "uploaded",
    })
    .select("id")
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: "Database error: " + dbError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: recording.id,
    storagePath,
    status: "uploaded",
  });
}
