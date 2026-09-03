---
name: project-phase4-results
description: Phase 4 spike results (Sept 2026) — all passed; ILLUSTRATED style chosen for story videos; de-aging fails without era-matched photos; flux-kontext-pro on Replicate is the image model
metadata: 
  node_type: memory
  type: project
  originSessionId: 52faca79-125f-4d90-8d35-8ebe713012ae
  modified: 2026-09-03T02:35:47.313Z
---

Phase 4 de-risking spikes all completed Sept 2 2026, total cost ~$0.35:

1. **Scene mapping: PASS.** claude-opus-5 with word-index markers (⟦N⟧ every 25 words) cut a real 6-min story into 11 scenes with correct beats/settings/image prompts and characters. Known fixes for production: scenes share boundary words (normalize: next scene's start wins) and ~25% of cuts land 1-2 words past sentence end (snap-to-sentence post-process). Spike: spikes/scene-mapping/run.mjs.
2. **Render: PASS.** Local ffmpeg 8 does zoompan Ken Burns + xfade crossfades + title card + watermark overlay; 21s 1080p in ~30s. Caveat: Homebrew ffmpeg lacks drawtext — text pre-rendered via Pillow PNGs. Production render = Trigger.dev task with ffmpeg build extension.
3. **Flux identity: CONDITIONAL PASS** via black-forest-labs/flux-kontext-pro on Replicate (input_image + prompt, seed for reproducibility, ~$0.04/img). Same-age scene placement and style transfer keep Bumper's identity across different reference photos; **de-aging LOSES identity** — young-era scenes need scanned photos of him young, or go illustrated-generic. AI text in images still garbles (neon sign "Pook haul") — avoid legible text in prompts.

**Sean chose ILLUSTRATED style (warm storybook, like the t3 test) for all story videos** — most reliable, no uncanny valley, era-flexible.

Notes: Replicate API blocks python-urllib UA via Cloudflare (error 1010) — use curl. Family photos live in spikes/flux-identity/photos/ and are gitignored — NEVER commit them. Sean's dad's real reference photo set (8 photos, current age) is in place; young-era photos not yet provided. Related: [[project-video-pipeline]], [[project-phase-status]].
