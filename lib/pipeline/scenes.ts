import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/types";
import { generateWithLLM } from "../ai/provider";
import type { TranscriptWord } from "./transcription";

// Production version of the Phase 4 scene-mapping spike, with the two fixes
// it identified: scene boundaries are normalized (next scene's start wins)
// and cuts snap to the nearest sentence end within a small window.

const SCENE_SYSTEM = `You are a film editor cutting a first-person spoken story into visual scenes for an illustrated video. The transcript has word-index markers like ⟦125⟧ before every 25th word — use them to compute exact word indices.

Scene rules:
- Break scenes on narrative events: new character, location change, time jump, dramatic turn. Never on a fixed interval.
- Target one scene per 30-60 seconds of speech; minimum scene length ~15 seconds of speech.
- start_word_index of scene 0 is 0; each scene starts where the previous ends; the last scene ends at the final word.
- Cut at natural sentence boundaries whenever possible.

Return ONLY a JSON object:
{
  "characters": [{"name": "...", "role": "...", "physical_description_in_text": "quote or null"}],
  "scenes": [
    {
      "index": 0,
      "start_word_index": 0,
      "setting": "concrete visual setting",
      "beat": "one of: arrival, buildup, turn, climax, aftermath, reflection",
      "characters_present": ["narrator"],
      "image_prompt": "one-sentence visual description for an illustrator, no proper names"
    }
  ]
}`;

export interface AnalyzedScene {
  index: number;
  startMs: number;
  endMs: number;
  setting: string;
  beat: string;
  charactersPresent: string[];
  imagePrompt: string;
}

export interface SceneAnalysis {
  scenes: AnalyzedScene[];
  characters: { name: string; role: string }[];
}

function snapToSentence(words: TranscriptWord[], idx: number, window = 6): number {
  // Prefer starting a scene right AFTER a sentence-ending word.
  if (idx <= 0 || idx >= words.length) return Math.max(0, Math.min(idx, words.length));
  for (let d = 0; d <= window; d++) {
    for (const candidate of [idx - d, idx + d]) {
      if (candidate > 0 && candidate <= words.length && /[.!?]$/.test(words[candidate - 1].word)) {
        return candidate;
      }
    }
  }
  return idx;
}

export async function analyzeScenes(
  transcription: string,
  words: TranscriptWord[]
): Promise<SceneAnalysis> {
  const marked = words
    .map((w, i) => (i % 25 === 0 ? `⟦${i}⟧${w.word}` : w.word))
    .join(" ");

  const result = await generateWithLLM(
    SCENE_SYSTEM,
    `Cut this story into scenes:\n\n${marked}`
  );
  const match = result.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Scene analysis returned no JSON");
  const parsed = JSON.parse(match[0]) as {
    characters?: { name?: string; role?: string }[];
    scenes?: {
      index?: number;
      start_word_index?: number;
      setting?: string;
      beat?: string;
      characters_present?: string[];
      image_prompt?: string;
    }[];
  };
  if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
    throw new Error("Scene analysis returned no scenes");
  }

  // Normalize: sort by start, snap starts to sentence boundaries, each scene
  // ends where the next begins, last scene ends at the final word.
  const starts = parsed.scenes
    .map((s) => Math.max(0, Math.min(s.start_word_index ?? 0, words.length - 1)))
    .sort((a, b) => a - b);
  starts[0] = 0;
  const snapped = starts.map((s, i) => (i === 0 ? 0 : snapToSentence(words, s)));

  const scenes: AnalyzedScene[] = [];
  const ordered = [...parsed.scenes].sort(
    (a, b) => (a.start_word_index ?? 0) - (b.start_word_index ?? 0)
  );
  for (let i = 0; i < ordered.length; i++) {
    const startIdx = snapped[i];
    const endIdx = i + 1 < snapped.length ? snapped[i + 1] : words.length;
    if (endIdx <= startIdx) continue; // collapsed by snapping — drop
    scenes.push({
      index: scenes.length,
      startMs: Math.round(words[startIdx].start * 1000),
      endMs: Math.round(words[endIdx - 1].end * 1000),
      setting: ordered[i].setting ?? "",
      beat: ordered[i].beat ?? "buildup",
      charactersPresent: Array.isArray(ordered[i].characters_present)
        ? ordered[i].characters_present!.filter((c): c is string => typeof c === "string")
        : [],
      imagePrompt: ordered[i].image_prompt ?? ordered[i].setting ?? "",
    });
  }
  if (scenes.length === 0) throw new Error("All scenes collapsed during normalization");

  return {
    scenes,
    characters: (parsed.characters ?? [])
      .filter((c) => typeof c?.name === "string")
      .map((c) => ({ name: c.name as string, role: c.role ?? "" })),
  };
}

/** Persist analysis into story_scenes (idempotent: skips if rows exist). */
export async function ensureStoryScenes(
  supabase: SupabaseClient<Database>,
  storyId: string,
  userId: string,
  transcription: string,
  words: TranscriptWord[]
): Promise<number> {
  const { count } = await supabase
    .from("story_scenes")
    .select("id", { count: "exact", head: true })
    .eq("story_id", storyId);
  if ((count ?? 0) > 0) return count!;

  const analysis = await analyzeScenes(transcription, words);

  // Persist discovered characters so users can attach photos/descriptions.
  // ignoreDuplicates: never clobber a character the user has already edited.
  if (analysis.characters.length > 0) {
    await supabase.from("characters").upsert(
      analysis.characters
        .filter((c) => c.name.length <= 80)
        .map((c) => ({ user_id: userId, name: c.name, role: c.role || null })),
      { onConflict: "user_id,name", ignoreDuplicates: true }
    );
  }
  const { error } = await supabase.from("story_scenes").insert(
    analysis.scenes.map((s) => ({
      story_id: storyId,
      index: s.index,
      start_ms: s.startMs,
      end_ms: s.endMs,
      setting: s.setting,
      beat: s.beat,
      characters_present: s.charactersPresent,
      image_prompt: s.imagePrompt,
    }))
  );
  if (error) throw new Error("Failed to save scenes: " + error.message);
  return analysis.scenes.length;
}
