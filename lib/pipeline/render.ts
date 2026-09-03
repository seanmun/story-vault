import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/types";

// Assembles: title card (3s) → illustrated scenes with Ken Burns motion and
// 0.5s crossfades whose midpoints land exactly on the audio cut times →
// end card (3s). Original recording is the narration throughout.

const FADE = 0.5;
const CARD_S = 3;
const FPS = 25;
const W = 1920;
const H = 1080;

// Alternating Ken Burns motions (from the Phase 4 render spike)
const MOTIONS = [
  (f: number) => `z='1.05+${(0.12 / f).toFixed(5)}*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
  (f: number) => `z='1.22-${(0.12 / f).toFixed(5)}*on':x='(iw-iw/zoom)*(on/${f})':y='ih/2-(ih/zoom/2)'`,
  (f: number) => `z='1.15':x='(iw-iw/zoom)*(1-on/${f})':y='(ih-ih/zoom)*(on/${f})'`,
  (f: number) => `z='1.05+${(0.14 / f).toFixed(5)}*on':x='(iw-iw/zoom)':y='(ih-ih/zoom)*(1-on/${f})'`,
  (f: number) => `z='1.18-${(0.08 / f).toFixed(5)}*on':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(on/${f})'`,
];

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function makeCard(
  file: string,
  title: string,
  subtitle: string | null
): Promise<void> {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1a120a"/>
    <text x="50%" y="48%" text-anchor="middle" font-family="Georgia, serif"
      font-size="84" fill="#d9b45b">${escXml(title)}</text>
    ${subtitle ? `<text x="50%" y="58%" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#c8c8c8">${escXml(subtitle)}</text>` : ""}
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
}

async function makeWatermark(file: string): Promise<void> {
  const svg = `<svg width="320" height="64" xmlns="http://www.w3.org/2000/svg">
    <text x="10" y="42" font-family="Georgia, serif" font-size="36"
      fill="rgba(255,255,255,0.35)">StoryVault</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
}

function ffmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-y", "-loglevel", "error", ...args]);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-800)}`))
    );
    proc.on("error", reject);
  });
}

export interface RenderScene {
  index: number;
  startMs: number;
  endMs: number;
  imagePath: string;
}

/** Renders the story video and uploads it. Returns the storage path. */
export async function renderStoryVideo(
  supabase: SupabaseClient<Database>,
  opts: {
    storyId: string;
    userId: string;
    title: string;
    era: string | null;
    audioStoragePath: string;
    scenes: RenderScene[];
  }
): Promise<{ videoPath: string; durationMs: number }> {
  const { storyId, userId, title, era, audioStoragePath, scenes } = opts;
  const dir = await mkdtemp(path.join(tmpdir(), `sv-${storyId.slice(0, 8)}-`));
  try {
    // Fetch audio + scene images from storage
    const { data: audioBlob, error: audioErr } = await supabase.storage
      .from("recordings")
      .download(audioStoragePath);
    if (audioErr || !audioBlob) throw new Error("Audio download failed: " + audioErr?.message);
    const audioExt = audioStoragePath.split(".").pop() || "webm";
    const audioFile = path.join(dir, `audio.${audioExt}`);
    await writeFile(audioFile, Buffer.from(await audioBlob.arrayBuffer()));

    const stills: string[] = [];
    for (const scene of scenes) {
      const { data, error } = await supabase.storage
        .from("recordings")
        .download(scene.imagePath);
      if (error || !data) throw new Error(`Scene ${scene.index} image download failed`);
      const f = path.join(dir, `still${scene.index}.jpg`);
      // Upscale so zoompan has room to move without softening
      await sharp(Buffer.from(await data.arrayBuffer()))
        .resize(Math.round(W * 1.25), Math.round(H * 1.25), { fit: "cover" })
        .toFile(f);
      stills.push(f);
    }

    const titleCard = path.join(dir, "title.png");
    const endCard = path.join(dir, "end.png");
    const wm = path.join(dir, "wm.png");
    await makeCard(titleCard, title, era);
    await makeCard(endCard, "StoryVault", "a story worth keeping");
    await makeWatermark(wm);

    // Clip plan. Cut times in the OUTPUT timeline: audio starts after the
    // title card, so cut k lands at CARD_S + endMs/1000. Clip durations are
    // padded so each crossfade's midpoint hits its cut exactly.
    const audioEndS = scenes[scenes.length - 1].endMs / 1000;
    const cuts = [
      CARD_S,
      ...scenes.slice(0, -1).map((s) => CARD_S + s.endMs / 1000),
      CARD_S + audioEndS,
    ];
    const clips: { file: string; dur: number; motion?: string }[] = [];
    clips.push({ file: titleCard, dur: cuts[0] + FADE / 2 });
    for (let i = 0; i < scenes.length; i++) {
      const rawDur = (i === 0 ? cuts[1] - CARD_S : cuts[i + 1] - cuts[i]) as number;
      const pad = i === 0 || i === scenes.length - 1 ? FADE / 2 + FADE / 2 : FADE;
      const frames = Math.max(2, Math.round((rawDur + pad) * FPS));
      clips.push({
        file: stills[i],
        dur: rawDur + pad,
        motion: MOTIONS[i % MOTIONS.length](frames),
      });
    }
    clips.push({ file: endCard, dur: CARD_S + FADE / 2 });

    // Render each clip
    const clipFiles: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      const out = path.join(dir, `clip${i}.mp4`);
      const vf = c.motion
        ? `zoompan=${c.motion}:d=${Math.round(c.dur * FPS)}:s=${W}x${H}:fps=${FPS},format=yuv420p`
        : `fps=${FPS},scale=${W}:${H},format=yuv420p`;
      await ffmpeg([
        "-loop", "1", "-i", c.file,
        "-vf", vf, "-t", c.dur.toFixed(3),
        "-c:v", "libx264", "-preset", "fast", out,
      ]);
      clipFiles.push(out);
    }

    // Crossfade chain + watermark + audio (delayed past the title card)
    const inputs = clipFiles.flatMap((f) => ["-i", f]);
    let filter = "";
    let acc = clips[0].dur;
    let prev = "[0]";
    for (let i = 1; i < clipFiles.length; i++) {
      const label = i === clipFiles.length - 1 ? "[vx]" : `[x${i}]`;
      filter += `${prev}[${i}]xfade=transition=fade:duration=${FADE}:offset=${(acc - FADE).toFixed(3)}${label};`;
      acc += clips[i].dur - FADE;
      prev = label;
    }
    filter += `[vx][${clipFiles.length}]overlay=W-w-30:H-h-20,format=yuv420p[vout];`;
    filter += `[${clipFiles.length + 1}:a]adelay=${CARD_S * 1000}|${CARD_S * 1000},apad=pad_dur=${CARD_S + 1}[aout]`;

    const finalFile = path.join(dir, "final.mp4");
    await ffmpeg([
      ...inputs, "-i", wm, "-i", audioFile,
      "-filter_complex", filter,
      "-map", "[vout]", "-map", "[aout]",
      // Bitrate-capped: Supabase free tier rejects files over 50MB. Ken Burns
      // still-motion compresses extremely well, so ~900kbps 1080p holds up.
      // (Supabase Pro lifts the cap — raise these when that happens.)
      "-c:v", "libx264", "-preset", "medium", "-crf", "23",
      "-maxrate", "900k", "-bufsize", "1800k",
      "-c:a", "aac", "-b:a", "96k",
      "-t", acc.toFixed(3),
      finalFile,
    ]);

    const videoPath = `${userId}/videos/${storyId}.mp4`;
    const { readFile } = await import("node:fs/promises");
    const finalBuffer = await readFile(finalFile);
    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(videoPath, finalBuffer, { contentType: "video/mp4", upsert: true });
    if (uploadError) throw new Error("Video upload failed: " + uploadError.message);

    return { videoPath, durationMs: Math.round(acc * 1000) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
