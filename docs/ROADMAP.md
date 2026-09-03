# StoryVault Roadmap

_Last updated: 2026-09-03. The core loop is live end-to-end: record → story →
illustrated film in the storyteller's voice, with a persistent character cast._

## Now — no code, unlocks everything (Sean)

1. **Photos**: your own photo on the Narrator character; dad's young-era
   scans (20s–40s) into Bumper's photo strip — before remaking the billiards
   film, tap the young photo so it's "in films".
2. **Resend API key** → `.env.local` + Vercel → unlocks the "your story is
   ready" email (build is ~an hour once the key exists).
3. **Supabase Pro decision** ($25/mo): lifts the 50MB file cap → uncapped
   film bitrate. Current ~900kbps quality is respectable; Pro makes it crisp.
4. **The milestone**: dad's account, his phone, the billiards story.

## Next build items

- **"Your story is ready" email** (blocked on the Resend key): thumbnail,
  title, link — spec Stage 6.
- **Era-aware reference selection** (blocked on young photos existing): pick
  the character photo whose era matches the story's `time_period`
  automatically instead of the manual "in films" toggle. `character_photos`
  already carries an `era_label` column for this.
- **Real-world polish**: whatever day-to-day use surfaces (video seek
  performance, mobile player quirks, onboarding copy).

## Later (designed, deliberately parked)

- **Compiled stories**: AI weaves N recordings into one "greatest hits" arc —
  reuses the scene/image/render stages; needs synthesized narration, so it's
  gated on the voice-consent work.
- **Voice features** (consent-gated, per spec §4): voice disguise, posthumous
  gap-filling. The existing ElevenLabs TTS/clone code is frozen, not removed.
- **Family sharing**: the schema exists (groups, members, RLS fixed in
  Phase 1) but no product surface; invite-code redemption needs a
  SECURITY DEFINER function.
- **Succession / heirs**: inactivity transfer to designated heirs. Legally
  and emotionally the hardest feature — gets its own spec (per the original
  plan, kept separate from video work).

## Known constraints & accepted tradeoffs

- Kontext takes **one** input image, so a scene with two photographed
  characters anchors on one identity (narrator first). Multi-character
  compositing is an open research-y item.
- De-aging from an old photo loses identity — era scenes require era photos
  (or stay illustrated-generic).
- Free-tier Supabase: 50MB/file (video bitrate capped), no storage upload
  resumability.
- AI-generated text inside images garbles (signs, lettering) — prompts
  explicitly forbid text in frame.
- One film version per story today (`render_version` column is ready for
  proper versioning when re-render history matters).
