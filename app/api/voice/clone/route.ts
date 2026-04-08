import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createVoiceClone, deleteVoiceClone } from "@/lib/ai/elevenlabs";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await request.json();

  if (tier !== "basic" && tier !== "enhanced") {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, elevenlabs_voice_id, voice_clone_tier")
    .eq("id", user.id)
    .single();

  // Don't re-clone at the same tier
  if (profile?.voice_clone_tier === tier) {
    return NextResponse.json({
      voiceId: profile?.elevenlabs_voice_id,
      tier,
      status: "already_exists",
    });
  }

  // Get recordings — pick the best ones by duration
  const minDuration = tier === "basic" ? 300 : 1800; // 5min or 30min
  const { data: recordings } = await supabase
    .from("recordings")
    .select("id, storage_path, duration_seconds")
    .eq("user_id", user.id)
    .eq("status", "transcribed")
    .order("duration_seconds", { ascending: false });

  if (!recordings || recordings.length === 0) {
    return NextResponse.json({ error: "No recordings available" }, { status: 400 });
  }

  // Check cumulative duration
  const totalSeconds = recordings.reduce((sum, r) => sum + r.duration_seconds, 0);
  if (totalSeconds < minDuration) {
    return NextResponse.json({
      error: `Need ${Math.ceil(minDuration / 60)} minutes of recordings. You have ${Math.floor(totalSeconds / 60)} minutes.`,
    }, { status: 400 });
  }

  // Select recordings up to ~10 minutes for basic, ~30 for enhanced
  // ElevenLabs instant clone works best with a few good samples
  const maxSamples = tier === "basic" ? 5 : 10;
  const selectedRecordings = recordings.slice(0, maxSamples);

  try {
    // Download audio files from Supabase Storage
    const audioFiles = [];
    for (const rec of selectedRecordings) {
      const { data, error } = await supabase.storage
        .from("recordings")
        .download(rec.storage_path);

      if (error || !data) continue;

      const arrayBuffer = await data.arrayBuffer();
      audioFiles.push({
        buffer: Buffer.from(arrayBuffer),
        filename: `recording_${rec.id}.webm`,
      });
    }

    if (audioFiles.length === 0) {
      return NextResponse.json({ error: "Could not download recordings" }, { status: 500 });
    }

    // Delete old voice clone if upgrading
    if (profile?.elevenlabs_voice_id) {
      try {
        await deleteVoiceClone(profile.elevenlabs_voice_id);
      } catch {
        // OK if delete fails — might already be gone
      }
    }

    // Create new voice clone
    const name = profile?.display_name || "Storyteller";
    const voiceId = await createVoiceClone(
      `${name} (${tier === "basic" ? "Basic" : "Enhanced"})`,
      audioFiles
    );

    // Save to profile
    await supabase
      .from("profiles")
      .update({
        elevenlabs_voice_id: voiceId,
        voice_clone_tier: tier,
      })
      .eq("id", user.id);

    return NextResponse.json({
      voiceId,
      tier,
      status: "created",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Voice cloning failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
