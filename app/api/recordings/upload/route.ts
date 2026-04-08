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

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;
  const durationStr = formData.get("duration") as string | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const duration = durationStr ? parseInt(durationStr, 10) : 0;
  const fileExt = audioFile.type.includes("mp4") ? "mp4" : "webm";
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(fileName, audioFile, {
      contentType: audioFile.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  // Create recording record in database
  const { data: recording, error: dbError } = await supabase
    .from("recordings")
    .insert({
      user_id: user.id,
      storage_path: fileName,
      duration_seconds: duration,
      file_size_bytes: audioFile.size,
      mime_type: audioFile.type,
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
    storagePath: fileName,
    status: "uploaded",
  });
}
