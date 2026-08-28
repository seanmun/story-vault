import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStoryForRecording } from "@/lib/pipeline/story";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recordingId } = await request.json();

  if (typeof recordingId !== "string" || !recordingId) {
    return NextResponse.json({ error: "Missing recordingId" }, { status: 400 });
  }

  // Ownership check; generateStoryForRecording is idempotent — an existing
  // ready story short-circuits with no LLM spend.
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("id")
    .eq("id", recordingId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  try {
    const story = await generateStoryForRecording(supabase, recordingId);
    return NextResponse.json(story);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Story generation failed";
    const status = message.includes("no transcription") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
