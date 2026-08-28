import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeRecording } from "@/lib/pipeline/transcription";

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

  // Ownership check via RLS-scoped read (transcribeRecording itself runs on
  // whatever client we hand it — here the user-scoped one).
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("id, status, transcription, updated_at")
    .eq("id", recordingId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  // Idempotent: an existing transcription is returned, never re-billed.
  if (recording.status === "transcribed" && recording.transcription) {
    return NextResponse.json({
      transcription: recording.transcription,
      status: "transcribed",
    });
  }

  // Concurrency guard: a recent "transcribing" row means another run
  // (pipeline task or request) is already on it.
  if (
    recording.status === "transcribing" &&
    Date.now() - new Date(recording.updated_at).getTime() < 10 * 60 * 1000
  ) {
    return NextResponse.json(
      { error: "Transcription already in progress" },
      { status: 409 }
    );
  }

  try {
    const output = await transcribeRecording(supabase, recordingId);
    return NextResponse.json({
      transcription: output.text,
      status: "transcribed",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
