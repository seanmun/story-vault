import { task, schedules, logger } from "@trigger.dev/sdk";
import { createAdminClient } from "../lib/supabase/admin";
import { transcribeRecording } from "../lib/pipeline/transcription";
import { generateStoryForRecording } from "../lib/pipeline/story";

/**
 * The recording pipeline: transcribe (word-level timestamps) → generate story.
 * Durable and resumable — each retry picks up from DB state, so a completed
 * transcription is never paid for twice.
 */
export const processRecording = task({
  id: "process-recording",
  maxDuration: 600,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },
  run: async (payload: { recordingId: string }) => {
    const supabase = createAdminClient();

    const { data: recording } = await supabase
      .from("recordings")
      .select("id, status, transcription")
      .eq("id", payload.recordingId)
      .single();

    if (!recording) {
      logger.warn("Recording not found — skipping", payload);
      return { skipped: true };
    }

    if (recording.status !== "transcribed" || !recording.transcription) {
      logger.info("Transcribing", { recordingId: recording.id });
      await transcribeRecording(supabase, recording.id);
    } else {
      logger.info("Already transcribed — skipping to story", {
        recordingId: recording.id,
      });
    }

    const story = await generateStoryForRecording(supabase, recording.id);
    logger.info("Story ready", { storyId: story.id, title: story.title });
    return { storyId: story.id, title: story.title };
  },
});

const STUCK_AFTER_MS = 15 * 60 * 1000;

/**
 * Reaper: recordings stranded mid-pipeline (killed deploys, exhausted
 * retries, rows created before the pipeline existed) get re-queued instead
 * of sitting in "transcribing"/"uploaded" forever.
 */
export const reapStuckRecordings = schedules.task({
  id: "reap-stuck-recordings",
  cron: "*/30 * * * *",
  run: async () => {
    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - STUCK_AFTER_MS).toISOString();

    const { data: stuck } = await supabase
      .from("recordings")
      .select("id, status")
      .in("status", ["uploaded", "transcribing"])
      .lt("updated_at", cutoff)
      .limit(20);

    // Transcribed recordings whose story is stuck in "generating".
    const { data: stuckStories } = await supabase
      .from("stories")
      .select("recording_id, recordings!inner(status)")
      .eq("status", "generating")
      .eq("recordings.status", "transcribed")
      .lt("updated_at", cutoff)
      .limit(20);

    // Transcribed recordings with NO story at all — the gap between
    // transcription finishing and the story insert (killed deploys land here).
    const { data: storyless } = await supabase
      .from("recordings")
      .select("id, stories(id)")
      .eq("status", "transcribed")
      .is("stories", null)
      .lt("updated_at", cutoff)
      .limit(20);

    const ids = new Set<string>([
      ...(stuck ?? []).map((r) => r.id),
      ...(stuckStories ?? []).map((s) => s.recording_id),
      ...(storyless ?? []).map((r) => r.id),
    ]);

    if (ids.size === 0) {
      logger.info("Nothing stuck");
      return { requeued: 0 };
    }

    logger.info("Re-queueing stuck recordings", { ids: [...ids] });
    for (const recordingId of ids) {
      await processRecording.trigger({ recordingId });
    }
    return { requeued: ids.size };
  },
});

/**
 * Backfill: re-transcribe old recordings that predate word-level timestamps
 * (transcription_meta is null). The video pipeline needs the word array.
 * Trigger manually from the dashboard ("Test" tab); costs Deepgram per item.
 */
export const retranscribeBacklog = task({
  id: "retranscribe-backlog",
  maxDuration: 600,
  run: async (payload: { limit?: number }) => {
    const supabase = createAdminClient();
    const limit = payload.limit ?? 10;

    const { data: backlog } = await supabase
      .from("recordings")
      .select("id")
      .eq("status", "transcribed")
      .is("transcription_meta", null)
      .limit(limit);

    if (!backlog || backlog.length === 0) {
      logger.info("Backlog empty — all recordings have word timestamps");
      return { retranscribed: 0, remaining: 0 };
    }

    let done = 0;
    for (const rec of backlog) {
      try {
        await transcribeRecording(supabase, rec.id);
        done++;
      } catch (err) {
        logger.error("Backlog item failed", { recordingId: rec.id, err });
        // The old transcript text is intact — never downgrade a healthy row
        // to "failed" over a transient re-transcription error.
        await supabase
          .from("recordings")
          .update({ status: "transcribed" })
          .eq("id", rec.id);
      }
    }

    const { count } = await supabase
      .from("recordings")
      .select("id", { count: "exact", head: true })
      .eq("status", "transcribed")
      .is("transcription_meta", null);

    logger.info("Backlog batch done", { done, remaining: count ?? 0 });
    return { retranscribed: done, remaining: count ?? 0 };
  },
});
