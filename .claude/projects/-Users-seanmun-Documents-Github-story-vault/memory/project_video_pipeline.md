---
name: project-video-pipeline
description: "StoryVault is pivoting to an async story-video pipeline (word-timestamped transcription, Claude scene analysis, Flux images, ffmpeg Ken Burns video); original recording stays the narration, ElevenLabs demoted to disguise/compile/posthumous only"
metadata: 
  node_type: memory
  type: project
  originSessionId: 52faca79-125f-4d90-8d35-8ebe713012ae
  modified: 2026-08-25T19:17:29.748Z
---

As of Aug 2026, the agreed product direction (from Sean's spec, shared in conversation) is an async pipeline: recording → word-level transcription → Claude scene/character analysis (structured JSON) → Flux still images with identity consistency (reference photos, locked seeds) → ffmpeg Ken Burns video with watermark → email delivery. No video-gen models; the original recording is always the narration.

Spec stack assumptions were wrong and corrected: StoryVault uses Supabase (auth/Postgres/Storage, private `recordings` bucket), not Neon/Drizzle/Clerk/Convex. Inngest and Resend are additions, not existing. Key code fact: Deepgram already returns word-level timestamps that `app/api/transcribe/route.ts` discards; `recordings.transcription_meta` jsonb exists and is never written — Stage 1 of the spec is mostly wiring, not new integration.

ElevenLabs is explicitly NOT in the main video pipeline — reserved for voice disguise, compiled "greatest hits" stories, and posthumous gap-filling, all consent-gated. New tables planned: characters (user-scoped, reused across stories), story_scenes, story_videos (with render_version for re-renders), story_questions (character enrichment queue). Highest-risk piece is Flux identity consistency — standalone go/no-go spike before building the rest; fallback is faceless scenes + real photos. Succession/heir mechanics deliberately split out as its own future spec.

Related: [[project-collections]], [[user-sean]] (the storyteller is Sean's dad "Bumper", turning 70 Jan 2027 — soft deadline energy for shipping the video experience).
