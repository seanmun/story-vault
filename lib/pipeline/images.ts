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

/**
 * Generate one scene image and store it. Identity-anchored (Kontext + the
 * narrator's reference photo) when the narrator is in frame; plain
 * illustrated text-to-image otherwise. Idempotent per scene status.
 */
export async function generateSceneImage(
  supabase: SupabaseClient<Database>,
  opts: {
    scene: SceneRow;
    storyId: string;
    userId: string;
    referenceImagePath: string | null;
    lockedSeed: number;
  }
): Promise<string> {
  const { scene, storyId, userId, referenceImagePath, lockedSeed } = opts;
  const replicate = replicateClient();
  const seed = lockedSeed + scene.index;
  const scenePrompt = scene.image_prompt || scene.setting || "a quiet moment";
  const narratorInFrame =
    scene.characters_present.some((c) => /narrator/i.test(c)) &&
    !!referenceImagePath;

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
