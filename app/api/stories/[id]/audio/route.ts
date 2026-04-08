import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSpeech, getStockVoiceId } from "@/lib/ai/elevenlabs";

export const maxDuration = 120;

export async function POST(
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

  // Get the story
  const { data: story, error: fetchError } = await supabase
    .from("stories")
    .select("id, written_content, title, user_id, podcast_audio_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // Check if audio already exists
  if (story.podcast_audio_path) {
    return NextResponse.json({
      audioPath: story.podcast_audio_path,
      status: "ready",
    });
  }

  // Get user's voice clone or preference
  const { data: profile } = await supabase
    .from("profiles")
    .select("elevenlabs_voice_id, voice_preference")
    .eq("id", user.id)
    .single();

  const voiceId = profile?.elevenlabs_voice_id || getStockVoiceId(profile?.voice_preference || null);

  try {
    // Generate speech
    const audioBuffer = await generateSpeech(story.written_content, voiceId);

    // Upload to Supabase Storage
    const fileName = `${user.id}/stories/${story.id}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error("Upload failed: " + uploadError.message);
    }

    // Update story with audio path
    await supabase
      .from("stories")
      .update({ podcast_audio_path: fileName })
      .eq("id", story.id);

    return NextResponse.json({
      audioPath: fileName,
      status: "ready",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audio generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: stream the audio file
export async function GET(
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

  const { data: story } = await supabase
    .from("stories")
    .select("podcast_audio_path, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!story?.podcast_audio_path) {
    return NextResponse.json({ error: "No audio available" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("recordings")
    .download(story.podcast_audio_path);

  if (error || !data) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  const arrayBuffer = await data.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(arrayBuffer.byteLength),
    },
  });
}
