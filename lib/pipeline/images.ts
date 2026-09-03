import Replicate from "replicate";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/types";

// Illustrated style — the look Sean approved from the Phase 4 spike (t3).
// Applied to every scene so the video reads as one piece.
const STYLE =
  "Warm storybook illustration, visible painted brushwork, gentle warm " +
  "palette, soft golden light, children's-book quality, no text or lettering " +
  "anywhere in the image";

const IDENTITY_MODEL = "black-forest-labs/flux-kontext-pro";
const SCENE_MODEL = "black-forest-labs/flux-dev";

interface SceneRow {
  id: string;
  index: number;
  image_prompt: string | null;
  setting: string | null;
  characters_present: string[];
  status: string;
  seed: number | null;
}

function replicateClient() {
  const auth = process.env.REPLICATE_API_TOKEN;
  if (!auth) throw new Error("REPLICATE_API_TOKEN not configured");
  return new Replicate({ auth });
}

async function outputToBuffer(output: unknown): Promise<Buffer> {
  const first = Array.isArray(output) ? output[0] : output;
  if (first && typeof (first as { blob?: unknown }).blob === "function") {
    const blob = await (first as { blob: () => Promise<Blob> }).blob();
    return Buffer.from(await blob.arrayBuffer());
  }
  if (typeof first === "string") {
    const res = await fetch(first, { headers: { "User-Agent": "storyvault/1.0" } });
    if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error("Unrecognized Replicate output shape");
}

async function runWithBackoff(
  replicate: Replicate,
  model: `${string}/${string}`,
  input: Record<string, unknown>
): Promise<Buffer> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const output = await replicate.run(model, { input });
      return await outputToBuffer(output);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // 429 / transient — back off and retry; anything else fails fast.
      if (!/429|rate|timeout|502|503/i.test(msg)) throw err;
      await new Promise((r) => setTimeout(r, 15_000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export interface CharacterRef {
  name: string;
  aliases: string[];
  reference_image_path: string | null;
  locked_seed: number | null;
  physical_description: string | null;
}

/** Fold saved character descriptions into the illustrator prompt so people
 * without photos still look like themselves, story after story. */
function describePresent(present: string[], roster: CharacterRef[]): string {
  const norm = (s: string) => s.trim().toLowerCase();
  const bits: string[] = [];
  for (const name of present) {
    const c = roster.find(
      (r) =>
        r.physical_description &&
        (norm(r.name) === norm(name) || r.aliases.some((a) => norm(a) === norm(name)))
    );
    if (c && bits.length < 2) bits.push(`${c.name} looks like: ${c.physical_description}`);
  }
  return bits.length ? ` ${bits.join(". ")}.` : "";
}

/** Match a scene's present characters against the user's character roster.
 * Returns the first present character that has a reference photo — narrator
 * outranks the rest. (Kontext takes one input image, so multi-reference
 * scenes anchor on that one identity.) */
function matchReference(
  present: string[],
  roster: CharacterRef[]
): CharacterRef | null {
  const norm = (s: string) => s.trim().toLowerCase();
  const matches = (c: CharacterRef, name: string) =>
    norm(c.name) === norm(name) ||
    c.aliases.some((a) => norm(a) === norm(name));
  const ordered = [
    ...present.filter((p) => /narrator/i.test(p)),
    ...present.filter((p) => !/narrator/i.test(p)),
  ];
  for (const name of ordered) {
    const hit = roster.find((c) => c.reference_image_path && matches(c, name));
    if (hit) return hit;
  }
  return null;
}

/**
 * Generate one scene image and store it. Identity-anchored (Kontext + the
 * matched character's reference photo) when someone with a photo is in
 * frame; plain illustrated text-to-image otherwise. Idempotent per status.
 */
export async function generateSceneImage(
  supabase: SupabaseClient<Database>,
  opts: {
    scene: SceneRow;
    storyId: string;
    userId: string;
    characters: CharacterRef[];
    fallbackSeed: number;
  }
): Promise<string> {
  const { scene, storyId, userId, characters, fallbackSeed } = opts;
  const replicate = replicateClient();
  const matched = matchReference(scene.characters_present, characters);
  // A re-rolled scene carries its own fresh seed; otherwise derive stably.
  const seed = scene.seed ?? (matched?.locked_seed ?? fallbackSeed) + scene.index;
  const scenePrompt =
    (scene.image_prompt || scene.setting || "a quiet moment") +
    describePresent(scene.characters_present, characters);
  const referenceImagePath = matched?.reference_image_path ?? null;
  const narratorInFrame = !!referenceImagePath;

  await supabase
    .from("story_scenes")
    .update({ status: "generating", seed })
    .eq("id", scene.id);

  let buffer: Buffer;
  if (narratorInFrame) {
    const { data: signed, error: signError } = await supabase.storage
      .from("recordings")
      .createSignedUrl(referenceImagePath!, 3600);
    if (signError || !signed) {
      throw new Error("Could not sign reference image: " + signError?.message);
    }
    buffer = await runWithBackoff(replicate, IDENTITY_MODEL, {
      prompt: `Transform this into: ${scenePrompt}. Keep this man's face and identity clearly recognizable. ${STYLE}`,
      input_image: signed.signedUrl,
      aspect_ratio: "16:9",
      output_format: "jpg",
      seed,
    });
  } else {
    buffer = await runWithBackoff(replicate, SCENE_MODEL, {
      prompt: `${scenePrompt}. ${STYLE}`,
      aspect_ratio: "16:9",
      output_format: "jpg",
      output_quality: 90,
      num_outputs: 1,
      seed,
    });
  }

  const imagePath = `${userId}/scenes/${storyId}/${scene.index}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(imagePath, buffer, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw new Error("Scene image upload failed: " + uploadError.message);

  const { error: rowError } = await supabase
    .from("story_scenes")
    .update({ image_path: imagePath, status: "done" })
    .eq("id", scene.id);
  if (rowError) throw new Error("Scene row update failed: " + rowError.message);

  return imagePath;
}
