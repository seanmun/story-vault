import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { generateStoryVideo } from "@/trigger/video";

// POST: kick off (or resume) video generation for a story the caller owns.
// User-initiated by design — each video costs real money (~$1).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: story } = await supabase
    .from("stories")
    .select("id, status, recording_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }
  if (story.status !== "ready") {
    return NextResponse.json(
      { error: "Story isn't ready yet" },
      { status: 400 }
    );
  }

  const { data: recording } = await supabase
    .from("recordings")
    .select("transcription_meta")
    .eq("id", story.recording_id)
    .single();
  const words = (recording?.transcription_meta as { words?: unknown[] } | null)
    ?.words;
  if (!words?.length) {
    return NextResponse.json(
      { error: "This recording predates word timestamps — re-transcribe it first" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("story_videos")
    .select("id, status, updated_at")
    .eq("story_id", id)
    .order("render_version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "ready") {
    return NextResponse.json({ status: "ready" });
  }
  if (
    existing?.status === "rendering" &&
    Date.now() - new Date(existing.updated_at).getTime() < 30 * 60 * 1000
  ) {
    return NextResponse.json({ status: "rendering" });
  }

  // Create/refresh the rendering row up front so the page shows progress
  // immediately (writes go through service role — no client INSERT policy).
  const admin = createAdminClient();
  const { error: rowError } = await admin
    .from("story_videos")
    .upsert(
      { story_id: id, render_version: 1, status: "rendering" },
      { onConflict: "story_id,render_version" }
    );
  if (rowError) {
    return NextResponse.json({ error: "Could not start" }, { status: 500 });
  }

  try {
    await tasks.trigger<typeof generateStoryVideo>("generate-story-video", {
      storyId: id,
    });
  } catch (err) {
    console.error("Failed to queue generate-story-video", err);
    await admin
      .from("story_videos")
      .update({ status: "failed" })
      .eq("story_id", id)
      .eq("render_version", 1);
    return NextResponse.json(
      { error: "Could not start video generation" },
      { status: 502 }
    );
  }

  return NextResponse.json({ status: "rendering" });
}
