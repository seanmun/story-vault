# StoryVault Changelog

## 2026-09-03 — Characters & cast tools

- **Multiple photos per character** (`68343d0`, migration `00008`): each character
  holds a photo collection; tap one to mark it **"in films"** (the active
  reference the pipeline uses). Foundation for era-aware selection — a young
  photo of the storyteller will drive young-era scenes.
- **Story-level cast tools** (`8ffb8c3`): "People in This Story" on every story
  page — names matched against the account-level roster; unmatched names get
  confirmed against existing characters (saved as aliases, so "my dad" =
  Bumper everywhere) or created new; inline photo upload.
- **The film loop completed** (`dc5a2cf`): per-scene re-roll (tap ↺ on any
  scene thumbnail for a new illustration + re-render), "Remake with updated
  characters" (same compositions, current photos/descriptions), character
  descriptions folded into illustrator prompts, "what did X look like?"
  question cards whose answers persist on the character, Film badge in the
  library. Hardening: reaper covers every stuck state, backfill task can no
  longer downgrade healthy rows, env sync strips CR/quotes, AAA contrast.

## 2026-09-02/03 — The first film (Phase 5)

- **generate-story-video pipeline** (`3e3836b`, migration `00007`): scene
  analysis (word-timestamp cuts, sentence-snapped boundaries) → illustrated
  scene images (flux-kontext-pro for identity-anchored scenes, flux-dev for
  environments, locked seeds, fully resumable) → ffmpeg assembly (Ken Burns
  motion, crossfades landing on audio cut times, title/end cards, watermark)
  with the **original recording as narration**.
- **Create Video button** (`017326a`): per-story, with live progress
  ("Illustrating scene 4 of 12…") and a signed-URL player.
- **Characters system** (`8d31b6c`): `characters` table auto-populated by
  scene analysis; Settings → Characters page.
- First film rendered: *"The Pickup Truck Rule"* — 6:02, 12 scenes, ~$0.65.
- Production lessons encoded: render needs a `large-1x` machine (the xfade
  chain OOMs smaller ones); video bitrate capped ~900kbps to fit Supabase's
  free-tier 50MB object limit.

## 2026-09-02 — Phase 4 spikes (all passed)

- **Scene mapping**: Claude cuts a real 6-min story into 11 scenes with
  correct dramatic beats and usable image prompts (~$0.10/story).
- **Render**: ffmpeg Ken Burns + crossfades + cards + watermark, 21s sample
  in ~30s.
- **Flux identity** (the go/no-go): same-era scene placement and storybook
  illustration keep the subject's identity across different reference photos;
  **de-aging does not** — young-era scenes need era-matched photos.
  **Decision: illustrated style for all story films.**

## 2026-09-01/02 — Incident & recovery

Three compounding bugs made the live site appear broken (data was never lost):

1. `CREATE UNIQUE INDEX` ≠ unique *constraint* — PostgREST kept returning the
   stories embed as an array while the page expected an object, hiding every
   story in the library. Fixed with a real constraint + both-shapes rendering.
2. The storage bucket's new MIME allowlist rejected Chrome's
   `audio/webm;codecs=opus` (exact-subtype matching server-side), blocking
   all uploads. Fixed by clearing the allowlist and normalizing the upload's
   content type.
3. The "service role" key in every environment was actually the anon key
   pasted twice — the background pipeline could see nothing through RLS.
   Fixed with the real key, verified by decoding the JWT role claim.

Also: `PIPELINE_ENABLED` flag added so a misconfigured pipeline can never
again silently swallow recordings (`aac5c93`).

## 2026-08-27 → 09-02 — Phase 3: durable pipeline

- Trigger.dev orchestration (`6967a31`): `process-recording`
  (transcribe → story, retries, resumes from DB state), a 30-minute reaper
  for stuck rows, `retranscribe-backlog` for old recordings.
- **Word-level timestamps** captured into `transcription_meta` (Deepgram; the
  video pipeline's backbone), iOS filename fix, empty transcripts fail loudly.
- Idempotency: unique story per recording, short-circuiting routes, 60k-char
  LLM input cap, 50 recordings/day/user.
- Typed `Database` generic on all Supabase clients + service-role admin
  client; official `@anthropic-ai/sdk` with `claude-opus-5`.

## 2026-08-27 — Phases 1–2: security & accessibility

- **Security** (`dba1b29`, migrations `00005`/`00006`): family RLS recursion
  and self-join hole fixed, column-level profile grants (no self-serve
  subscription upgrades), open-redirect fix in the auth callback, session
  cookies carried through redirects, `middleware.ts` → `proxy.ts` (Next 16),
  recordings/create validates path ownership + server-measured sizes, finalize
  writes checked, voice clone create-before-delete, storage policies + limits.
- **Accessibility** (`fb6dc96`): bottom nav actually fixed (CSS layer bug),
  text presets aligned 20/24/28, AA/AAA contrast, 44px+ touch targets, real
  focus rings, upload feedback states with retries, error/not-found pages,
  expired-session bounces.

## 2026-08-25 — Full repo review

Three independent reviews (server, client, database) produced the findings
that became Phases 1–3, plus the video-pipeline plan of attack.
