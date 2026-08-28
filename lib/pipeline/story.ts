import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../supabase/types";
import { generateWithLLM } from "../ai/provider";
import {
  STORY_ENHANCE_SYSTEM,
  buildStoryEnhancePrompt,
} from "../ai/prompts/story-enhance";
import {
  THEME_EXTRACT_SYSTEM,
  buildThemeExtractPrompt,
} from "../ai/prompts/theme-extract";

// Hard cap on prompt input — a 10-minute recording is ~12–15k chars, so this
// is generous headroom while bounding LLM spend per run.
const MAX_TRANSCRIPT_CHARS = 60_000;

const LIFE_CHAPTERS = [
  "childhood",
  "youth",
  "career",
  "family",
  "adventures",
  "wisdom",
] as const;
type LifeChapter = (typeof LIFE_CHAPTERS)[number];

export interface GeneratedStory {
  id: string;
  title: string;
  status: "ready";
}

/**
 * Generate (or return the existing) story for a recording. Idempotent:
 * - a ready story short-circuits (no duplicate LLM spend)
 * - a generating/failed story row is reused, backed by the unique index
 *   on stories(recording_id)
 */
export async function generateStoryForRecording(
  supabase: SupabaseClient<Database>,
  recordingId: string
): Promise<GeneratedStory> {
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("id, user_id, transcription")
    .eq("id", recordingId)
    .single();

  if (fetchError || !recording) {
    throw new Error("Recording not found: " + recordingId);
  }
  if (!recording.transcription) {
    throw new Error("Recording has no transcription yet");
  }

  // One story per recording — reuse whatever exists.
  const { data: existing } = await supabase
    .from("stories")
    .select("id, title, status")
    .eq("recording_id", recordingId)
    .maybeSingle();

  if (existing?.status === "ready") {
    return { id: existing.id, title: existing.title, status: "ready" };
  }

  let storyId = existing?.id;
  if (!storyId) {
    const { data: created, error: createError } = await supabase
      .from("stories")
      .insert({
        recording_id: recordingId,
        user_id: recording.user_id,
        title: "Generating...",
        written_content: "",
        summary: "",
        status: "generating",
      })
      .select("id")
      .single();

    if (createError) {
      // Unique-index race: another run created it first — reuse that row.
      const { data: raced } = await supabase
        .from("stories")
        .select("id, title, status")
        .eq("recording_id", recordingId)
        .maybeSingle();
      if (!raced) {
        throw new Error("Failed to create story: " + createError.message);
      }
      if (raced.status === "ready") {
        return { id: raced.id, title: raced.title, status: "ready" };
      }
      storyId = raced.id;
    } else {
      storyId = created.id;
    }
  }

  const transcript = recording.transcription.slice(0, MAX_TRANSCRIPT_CHARS);

  try {
    const [storyResult, metadataResult] = await Promise.all([
      generateWithLLM(STORY_ENHANCE_SYSTEM, buildStoryEnhancePrompt(transcript)),
      generateWithLLM(THEME_EXTRACT_SYSTEM, buildThemeExtractPrompt(transcript)),
    ]);

    const storyData = parseJSON(storyResult.text);
    if (
      !storyData ||
      typeof storyData.title !== "string" ||
      typeof storyData.content !== "string"
    ) {
      throw new Error("Invalid story generation response");
    }

    const metadata = parseJSON(metadataResult.text);
    const lifeChapter: LifeChapter =
      typeof metadata?.life_chapter === "string" &&
      (LIFE_CHAPTERS as readonly string[]).includes(metadata.life_chapter)
        ? (metadata.life_chapter as LifeChapter)
        : "wisdom";
    const themes = Array.isArray(metadata?.themes)
      ? metadata.themes.filter((t): t is string => typeof t === "string")
      : [];

    const { error: updateError } = await supabase
      .from("stories")
      .update({
        title: storyData.title,
        written_content: storyData.content,
        summary: typeof storyData.summary === "string" ? storyData.summary : "",
        themes,
        characters: (metadata?.characters ?? []) as Json,
        time_period:
          typeof metadata?.time_period === "string" ? metadata.time_period : null,
        location:
          typeof metadata?.location === "string" ? metadata.location : null,
        life_chapter: lifeChapter,
        status: "ready",
      })
      .eq("id", storyId);

    if (updateError) {
      throw new Error("Failed to save story: " + updateError.message);
    }

    return { id: storyId, title: storyData.title, status: "ready" };
  } catch (err) {
    await supabase
      .from("stories")
      .update({ status: "failed" })
      .eq("id", storyId);
    throw err;
  }
}

function parseJSON(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
