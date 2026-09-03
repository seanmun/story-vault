import { task, logger } from "@trigger.dev/sdk";
import { randomInt } from "node:crypto";
import { createAdminClient } from "../lib/supabase/admin";
import { ensureStoryScenes } from "../lib/pipeline/scenes";
import { generateSceneImage } from "../lib/pipeline/images";
import { renderStoryVideo } from "../lib/pipeline/render";
import type { TranscriptWord } from "../lib/pipeline/transcription";

/**
 * Story → illustrated video (spec Stages 2, 4, 5). Resumable: scenes and
 * images are persisted per-step, so a retry picks up where it died instead
 * of re-billing Replicate.
 */
export const generateStoryVideo = task({
  id: "generate-story-video",
  maxDuration: 1800,
  // large-1x: the ffmpeg xfade chain decodes every clip concurrently —
  // medium-1x OOMs on ~12-scene renders.
  machine: { preset: "large-1x" },
  retry: { maxAttempts: 2, minTimeoutInMs: 30_000, maxTimeoutInMs: 120_000, factor: 2 },
  run: async (payload: { storyId: string }) => {
    const supabase = createAdminClient();

    const { data: story } = await supabase
      .from("stories")
      .select("id, user_id, recording_id, title, time_period, status")
      .eq("id", payload.storyId)
      .single();
    if (!story || story.status !== "ready") {
      logger.warn("Story not found or not ready — skipping", payload);
      return { skipped: true };
    }

    const { data: recording } = await supabase
      .from("recordings")
      .select("id, storage_path, transcription, transcription_meta")
      .eq("id", story.recording_id)
      .single();
    const meta = recording?.transcription_meta as { words?: TranscriptWord[] } | null;
    if (!recording?.transcription || !meta?.words?.length) {
      throw new Error("Recording lacks word-level timestamps — re-transcribe first");
    }

    // Stage 2 — scene analysis (idempotent; also persists discovered characters)
    const sceneCount = await ensureStoryScenes(
      supabase, story.id, story.user_id, recording.transcription, meta.words
    );
    logger.info(`Scenes ready: ${sceneCount}`);

    // Narrator row exists so users always have a place to put their own photo
    await supabase.from("characters").upsert(
      {
        user_id: story.user_id,
        name: "Narrator",
        role: "storyteller",
        locked_seed: randomInt(1, 1_000_000),
      },
      { onConflict: "user_id,name", ignoreDuplicates: true }
    );

    // Full roster: scenes anchor on whichever present character has a photo
    const { data: roster } = await supabase
      .from("characters")
      .select("name, aliases, reference_image_path, locked_seed")
      .eq("user_id", story.user_id);

    // Stage 4 — images, sequential (Replicate rate limits), resumable
    const { data: scenes } = await supabase
      .from("story_scenes")
      .select("id, index, image_prompt, setting, characters_present, image_path, status, start_ms, end_ms")
      .eq("story_id", story.id)
      .order("index");
    if (!scenes?.length) throw new Error("No scenes found after analysis");

    for (const scene of scenes) {
      if (scene.status === "done" && scene.image_path) continue;
      logger.info(`Illustrating scene ${scene.index + 1}/${scenes.length}`);
      await generateSceneImage(supabase, {
        scene,
        storyId: story.id,
        userId: story.user_id,
        characters: roster ?? [],
        fallbackSeed: 42,
      });
    }

    // Stage 5 — assemble
    const { data: freshScenes } = await supabase
      .from("story_scenes")
      .select("index, start_ms, end_ms, image_path")
      .eq("story_id", story.id)
      .order("index");
    const renderScenes = (freshScenes ?? [])
      .filter((s): s is typeof s & { image_path: string } => !!s.image_path)
      .map((s) => ({ index: s.index, startMs: s.start_ms, endMs: s.end_ms, imagePath: s.image_path }));
    if (renderScenes.length !== scenes.length) {
      throw new Error(`Only ${renderScenes.length}/${scenes.length} scenes have images`);
    }

    const { data: videoRow, error: videoRowError } = await supabase
      .from("story_videos")
      .upsert(
        { story_id: story.id, render_version: 1, status: "rendering" },
        { onConflict: "story_id,render_version" }
      )
      .select("id")
      .single();
    if (videoRowError) throw new Error("Video row failed: " + videoRowError.message);

    logger.info("Rendering video");
    const { videoPath, durationMs } = await renderStoryVideo(supabase, {
      storyId: story.id,
      userId: story.user_id,
      title: story.title,
      era: story.time_period,
      audioStoragePath: recording.storage_path,
      scenes: renderScenes,
    });

    const { error: doneError } = await supabase
      .from("story_videos")
      .update({
        video_path: videoPath,
        thumbnail_path: renderScenes[0].imagePath,
        duration_ms: durationMs,
        status: "ready",
      })
      .eq("id", videoRow.id);
    if (doneError) throw new Error("Video finalize failed: " + doneError.message);

    logger.info("Video ready", { videoPath, durationMs });
    return { videoPath, durationMs, scenes: renderScenes.length };
  },
});
