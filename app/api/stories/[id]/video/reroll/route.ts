import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { tasks } from "@trigger.dev/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { generateStoryVideo } from "@/trigger/video";

// POST { sceneIndex } — re-roll one scene's illustration (new seed) and
// re-render the film. POST { all: true } — regenerate every scene (e.g.
// after adding character photos) and re-render.
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
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    sceneIndex?: number;
    all?: boolean;
  };

  const admin = createAdminClient();

  // Race guard: don't stack renders.
  const { data: existing } = await admin
    .from("story_videos")
    .select("status, updated_at")
    .eq("story_id", id)
    .eq("render_version", 1)
    .maybeSingle();
  if (
    existing?.status === "rendering" &&
    Date.now() - new Date(existing.updated_at).getTime() < 30 * 60 * 1000
  ) {
    return NextResponse.json(
      { error: "A render is already in progress" },
      { status: 409 }
    );
  }

  if (body.all) {
    // Keep seeds: same compositions, refreshed with current character
    // photos/descriptions. A new look per scene is what single re-roll is for.
    const { error } = await admin
      .from("story_scenes")
      .update({ status: "pending" })
      .eq("story_id", id);
    if (error) return NextResponse.json({ error: "Could not reset scenes" }, { status: 500 });
  } else if (typeof body.sceneIndex === "number") {
    const { data: updated, error } = await admin
      .from("story_scenes")
      .update({ status: "pending", seed: randomInt(1, 1_000_000) })
      .eq("story_id", id)
      .eq("index", body.sceneIndex)
      .select("id");
    if (error || !updated?.length) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }
  } else {
    return NextResponse.json(
      { error: "Pass sceneIndex or all: true" },
      { status: 400 }
    );
  }

  await admin
    .from("story_videos")
    .upsert(
      { story_id: id, render_version: 1, status: "rendering" },
      { onConflict: "story_id,render_version" }
    );

  try {
    await tasks.trigger<typeof generateStoryVideo>("generate-story-video", {
      storyId: id,
    });
  } catch (err) {
    console.error("Failed to queue reroll", err);
    return NextResponse.json({ error: "Could not start" }, { status: 502 });
  }

  return NextResponse.json({ status: "rendering" });
}
