import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithLLM } from "@/lib/ai/provider";
import {
  STORY_ENHANCE_SYSTEM,
  buildStoryEnhancePrompt,
} from "@/lib/ai/prompts/story-enhance";
import {
  THEME_EXTRACT_SYSTEM,
  buildThemeExtractPrompt,
} from "@/lib/ai/prompts/theme-extract";

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

  // Get the recording with transcription
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", recordingId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  if (!recording.transcription) {
    return NextResponse.json(
      { error: "Recording has no transcription yet" },
      { status: 400 }
    );
  }

  // Create story record in "generating" state
  const { data: story, error: createError } = await supabase
    .from("stories")
    .insert({
      recording_id: recordingId,
      user_id: user.id,
      title: "Generating...",
      written_content: "",
      summary: "",
      status: "generating",
    })
    .select("id")
    .single();

  if (createError) {
    return NextResponse.json(
      { error: "Failed to create story: " + createError.message },
      { status: 500 }
    );
  }

  try {
    // Run story enhancement and metadata extraction in parallel
    const [storyResult, metadataResult] = await Promise.all([
      generateWithLLM(
        STORY_ENHANCE_SYSTEM,
        buildStoryEnhancePrompt(recording.transcription)
      ),
      generateWithLLM(
        THEME_EXTRACT_SYSTEM,
        buildThemeExtractPrompt(recording.transcription)
      ),
    ]);

    // Parse story JSON
    const storyData = parseJSON(storyResult.text);
    if (!storyData || !storyData.title || !storyData.content) {
      throw new Error("Invalid story generation response");
    }

    // Parse metadata JSON
    const metadata = parseJSON(metadataResult.text);

    // The LLM's life_chapter feeds a Postgres enum — writing an unexpected
    // value would abort the whole update, so validate it first.
    const LIFE_CHAPTERS = [
      "childhood",
      "youth",
      "career",
      "family",
      "adventures",
      "wisdom",
    ];
    const lifeChapter =
      typeof metadata?.life_chapter === "string" &&
      LIFE_CHAPTERS.includes(metadata.life_chapter)
        ? metadata.life_chapter
        : "wisdom";
    const themes = Array.isArray(metadata?.themes)
      ? metadata.themes.filter((t): t is string => typeof t === "string")
      : [];

    // Update story with generated content
    const { error: updateError } = await supabase
      .from("stories")
      .update({
        title: storyData.title,
        written_content: storyData.content,
        summary: storyData.summary || "",
        themes,
        characters: metadata?.characters || [],
        time_period: metadata?.time_period || null,
        location: metadata?.location || null,
        life_chapter: lifeChapter,
        status: "ready",
      })
      .eq("id", story.id);

    if (updateError) {
      throw new Error("Failed to save story: " + updateError.message);
    }

    return NextResponse.json({
      id: story.id,
      title: storyData.title,
      status: "ready",
    });
  } catch (err) {
    // Mark story as failed
    await supabase
      .from("stories")
      .update({ status: "failed" })
      .eq("id", story.id);

    const message = err instanceof Error ? err.message : "Story generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseJSON(text: string): Record<string, unknown> | null {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    // Try finding JSON object in text
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
