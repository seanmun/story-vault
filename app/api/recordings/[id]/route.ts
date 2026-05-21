import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the recording to verify ownership and get storage path
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("id, storage_path, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  // Fetch associated story to get podcast audio path (if any)
  const { data: stories } = await supabase
    .from("stories")
    .select("id, podcast_audio_path")
    .eq("recording_id", id);

  // Collect storage paths to delete
  const pathsToDelete: string[] = [];
  if (recording.storage_path) pathsToDelete.push(recording.storage_path);
  if (stories) {
    for (const s of stories as { id: string; podcast_audio_path: string | null }[]) {
      if (s.podcast_audio_path) pathsToDelete.push(s.podcast_audio_path);
    }
  }

  // Delete storage files (best effort — don't block on errors)
  if (pathsToDelete.length > 0) {
    await supabase.storage.from("recordings").remove(pathsToDelete);
  }

  // Delete recording — cascades to stories and collection_recordings via FK ON DELETE CASCADE
  const { error: deleteError } = await supabase
    .from("recordings")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Delete failed: " + deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
