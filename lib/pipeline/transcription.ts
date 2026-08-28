import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../supabase/types";

// Word-level timestamps are the backbone of the video pipeline's scene
// timing (spec Stage 1) — always capture and store them.
export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  speaker?: number;
}

export interface TranscriptionOutput {
  text: string;
  meta: {
    provider: string;
    model: string;
    confidence?: number;
    words: TranscriptWord[];
  };
}

const EXT_BY_MIME: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
};

export function extensionForMime(mimeType: string): string {
  return EXT_BY_MIME[mimeType.split(";")[0].trim()] ?? "webm";
}

/**
 * Transcribe a recording end-to-end: download from storage, run the
 * configured provider, persist text + word-level meta, and set status.
 * Idempotent per DB state: safe to re-run; marks the row failed on error.
 */
export async function transcribeRecording(
  supabase: SupabaseClient<Database>,
  recordingId: string
): Promise<TranscriptionOutput> {
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("id, storage_path, mime_type")
    .eq("id", recordingId)
    .single();

  if (fetchError || !recording) {
    throw new Error("Recording not found: " + recordingId);
  }

  await supabase
    .from("recordings")
    .update({ status: "transcribing" })
    .eq("id", recordingId);

  try {
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("recordings")
      .download(recording.storage_path);

    if (downloadError || !audioData) {
      throw new Error("Failed to download audio: " + downloadError?.message);
    }

    const provider = process.env.TRANSCRIPTION_PROVIDER || "deepgram";
    const output =
      provider === "deepgram"
        ? await transcribeWithDeepgram(audioData)
        : await transcribeWithWhisper(audioData, recording.mime_type);

    if (!output.text.trim()) {
      // A silent recording is a terminal state, not a success.
      await supabase
        .from("recordings")
        .update({ status: "failed" })
        .eq("id", recordingId);
      throw new Error("Transcription came back empty — was anything said?");
    }

    const { error: saveError } = await supabase
      .from("recordings")
      .update({
        transcription: output.text,
        transcription_meta: output.meta as unknown as Json,
        status: "transcribed",
      })
      .eq("id", recordingId);

    if (saveError) {
      throw new Error("Failed to save transcription: " + saveError.message);
    }

    return output;
  } catch (err) {
    await supabase
      .from("recordings")
      .update({ status: "failed" })
      .eq("id", recordingId);
    throw err;
  }
}

interface DeepgramWord {
  word: string;
  punctuated_word?: string;
  start: number;
  end: number;
  speaker?: number;
}

async function transcribeWithDeepgram(
  audio: Blob
): Promise<TranscriptionOutput> {
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
      signal: AbortSignal.timeout(300_000),
      body: audio,
    }
  );

  if (!response.ok) {
    throw new Error(`Deepgram error: ${response.status}`);
  }

  const result = await response.json();
  const alternative = result.results?.channels?.[0]?.alternatives?.[0];
  const words: TranscriptWord[] = (
    (alternative?.words ?? []) as DeepgramWord[]
  ).map((w) => ({
    word: w.punctuated_word ?? w.word,
    start: w.start,
    end: w.end,
    ...(typeof w.speaker === "number" ? { speaker: w.speaker } : {}),
  }));

  return {
    text: alternative?.transcript || "",
    meta: {
      provider: "deepgram",
      model: "nova-2",
      confidence: alternative?.confidence,
      words,
    },
  };
}

interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

async function transcribeWithWhisper(
  audio: Blob,
  mimeType: string
): Promise<TranscriptionOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const formData = new FormData();
  // OpenAI validates the file extension — it must match the actual container
  // (iOS Safari records audio/mp4, not webm).
  formData.append("file", audio, `recording.${extensionForMime(mimeType)}`);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "word");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(300_000),
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Whisper error: ${response.status}`);
  }

  const result = await response.json();
  const words: TranscriptWord[] = ((result.words ?? []) as WhisperWord[]).map(
    (w) => ({ word: w.word, start: w.start, end: w.end })
  );

  return {
    text: result.text || "",
    meta: {
      provider: "openai",
      model: "whisper-1",
      words,
    },
  };
}
