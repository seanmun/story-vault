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

  const { recordingId } = await request.json();

  if (!recordingId) {
    return NextResponse.json({ error: "Missing recordingId" }, { status: 400 });
  }

  // Get the recording
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", recordingId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  // Update status to transcribing
  await supabase
    .from("recordings")
    .update({ status: "transcribing" })
    .eq("id", recordingId);

  try {
    // Download audio from storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("recordings")
      .download(recording.storage_path);

    if (downloadError || !audioData) {
      throw new Error("Failed to download audio: " + downloadError?.message);
    }

    // Transcribe based on provider
    const provider = process.env.TRANSCRIPTION_PROVIDER || "deepgram";
    let transcription: string;

    if (provider === "deepgram") {
      transcription = await transcribeWithDeepgram(audioData);
    } else {
      transcription = await transcribeWithWhisper(audioData);
    }

    // Save transcription
    await supabase
      .from("recordings")
      .update({
        transcription,
        status: "transcribed",
      })
      .eq("id", recordingId);

    return NextResponse.json({ transcription, status: "transcribed" });
  } catch (err) {
    await supabase
      .from("recordings")
      .update({ status: "failed" })
      .eq("id", recordingId);

    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function transcribeWithDeepgram(audio: Blob): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY not configured");

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&paragraphs=true&diarize=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": audio.type,
      },
      body: audio,
    }
  );

  if (!response.ok) {
    throw new Error(`Deepgram error: ${response.status}`);
  }

  const result = await response.json();
  return result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
}

async function transcribeWithWhisper(audio: Blob): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const formData = new FormData();
  formData.append("file", audio, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("response_format", "text");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Whisper error: ${response.status}`);
  }

  return response.text();
}
