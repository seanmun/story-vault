---
name: project-status-sept2026
description: "As of Sept 3 2026 the full film loop is live — record→story→illustrated film with characters, re-roll/remake, question cards; remaining items all need Sean's input"
metadata: 
  node_type: memory
  type: project
  originSessionId: 52faca79-125f-4d90-8d35-8ebe713012ae
  modified: 2026-09-03T22:47:21.170Z
---

StoryVault status, end of Sept 3 2026 (site dc5a2cf, pipeline 20260903.6):

**Live end-to-end:** record → durable transcribe (word timestamps) → story → Create Video button → 12-scene illustrated film (flux-kontext-pro identity + flux-dev environments, ffmpeg Ken Burns, original audio narration) → player with scene strip. Per-scene re-roll (new seed) and "remake with updated characters" (same seeds, fresh references). Characters page (Settings→Characters) with photo upload + descriptions; descriptions fold into prompts; "what did X look like?" question cards auto-queue per story and persist answers to characters. Film badge in library. Hardening: reaper covers all stuck states incl. transcribed-with-no-story; backlog task never downgrades; env parser strips CR/quotes.

**First film:** "The Pickup Truck Rule" — 6:02, 12 scenes, ~$0.65. Bumper's photo saved as the "Bumper" character (Sean's account b294d916); Sean's Narrator slot is EMPTY until he uploads his own photo.

**Remaining, all blocked on Sean:** Resend key → ready email; his own photo → Narrator; dad's young-era scans → era scenes; Supabase Pro ($25/mo) decision → uncapped video bitrate (currently ~900kbps/50MB free-tier cap); dad's account onboarding (the real milestone, birthday Jan 2027). Parked by plan: compiled stories, voice features (consent-gated), family sharing, succession.

**Cost per film:** ~$0.65 (12 images) + pennies of compute. Render task needs large-1x (xfade OOMs medium).

Late Sept 3 additions (site f1da9db, migration 00008 applied): StoryCast on story pages — per-story people matched to the account roster, alias confirmation ("my dad"=Bumper), inline photo upload; character_photos table — multiple photos per character with an active "in films" selection (foundation for era-aware picks: young photo → young scenes). Sean's design call: characters live at account level, tools live in both places. Related: [[project-video-pipeline]], [[project-phase4-results]], [[project-incident-sept2026]].
