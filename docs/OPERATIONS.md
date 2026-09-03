# StoryVault Operations

_The knowledge that cost something to learn. Last updated: 2026-09-03._

## Stack

- **Next.js 16** (App Router, `proxy.ts` not `middleware.ts`) on **Vercel**
- **Supabase**: auth (cookie sessions via `@supabase/ssr`), Postgres with RLS,
  private `recordings` storage bucket (audio, scene images, videos, character
  photos — all under `{userId}/...` prefixes)
- **Trigger.dev**: background pipeline (project `proj_xkbhrclufzquqiasnaar`);
  tasks in `trigger/`, shared logic in `lib/pipeline/`
- **AI**: Deepgram nova-2 (word-level transcription), `claude-opus-5` via
  `@anthropic-ai/sdk` (story + scene analysis), Replicate
  `black-forest-labs/flux-kontext-pro` (identity scenes) + `flux-dev`
  (environments), ffmpeg + sharp (render, inside Trigger tasks)

## Deploys

- **Site**: push to `main` → Vercel auto-deploys.
- **Pipeline**: `npx trigger.dev@4.5.15 deploy` — pin the CLI version to the
  installed `@trigger.dev/sdk` version or deploy aborts on mismatch.
  `syncEnvVars` pushes task env vars from **your local `.env.local`** on every
  deploy (override on) — only deploy from a machine whose `.env.local` is
  correct.
- **Migrations**: files in `supabase/migrations/`, applied by pasting into the
  Supabase dashboard SQL editor (no CLI link). Applied through `00008`.

## Environment variables

Names only — values live in `.env.local`, Vercel (Production+Preview), and
Trigger.dev (synced at deploy):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `TRIGGER_SECRET_KEY` (prod `tr_prod_…` in
Vercel; dev `tr_dev_…` locally), `TRIGGER_SECRET_KEY_PROD` (local-only
convenience copy), `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
`REPLICATE_API_TOKEN`, `ELEVENLABS_API_KEY` (frozen feature),
`TRANSCRIPTION_PROVIDER=deepgram`, `LLM_PROVIDER=anthropic`,
`PIPELINE_ENABLED=true` (kill switch: unset/false reverts recording flow to
the client-driven chain).

**⚠️ Supabase key check**: anon and service keys look identical. Verify by
decoding the JWT payload — `role` must be `service_role`. Never trust prefix
or length.

## Costs (per 10-min story, approx.)

| Item | Cost |
|---|---|
| Transcription (Deepgram) | ~$0.06 |
| Story + scene analysis (Claude) | ~$0.20 |
| Scene images (12–15 × Flux) | ~$0.50–0.70 |
| Render compute (Trigger large-1x) | pennies |
| **Film total** | **~$0.65–1.00** |

Re-roll one scene ≈ $0.04. "Remake with updated characters" re-bills all
scene images.

## Hard-won gotchas

- **`CREATE UNIQUE INDEX` is not a constraint** — PostgREST only switches an
  embed to to-one (object) when a `pg_constraint` row exists. Use
  `ADD CONSTRAINT ... UNIQUE`, then `NOTIFY pgrst, 'reload schema'`.
- **Storage MIME allowlists match subtypes exactly** — `audio/webm;codecs=opus`
  fails against `audio/webm`. The `recordings` bucket allowlist is NULL on
  purpose; uploads normalize the blob's type client-side.
- **Supabase free tier caps files at 50MB** — even bucket config can't exceed
  it. Video encode is bitrate-capped (~900kbps + 96k audio) to fit.
- **Render machine**: `generate-story-video` needs `large-1x`; the ffmpeg
  xfade chain decodes every clip concurrently and OOMs `medium-1x`.
- **Replicate + Cloudflare**: python-urllib's user agent gets error 1010;
  use curl or the official SDK. New-account billing takes a few minutes to
  propagate after buying credit (402s in the interim).
- **`npx` can eat stdin** — piping a secret into `npx vercel env add` stored
  an empty value once. Call the resolved binary directly and redirect from a
  file.
- **React compiler lint** flags async setState-after-await in effects
  (`react-hooks/set-state-in-effect`) and `Date.now()` in component-scoped
  functions (`react-hooks/purity`); the codebase uses documented suppressions
  and module-level helpers respectively.
- **Trigger.dev pipeline is resumable by DB state**: scenes/images persist per
  step, so re-triggering a failed run never re-bills completed work.

## Where things live

- `lib/pipeline/` — transcription, story, scenes, images, render (shared by
  tasks and API routes)
- `trigger/` — `pipeline.ts` (process-recording, reaper, backlog),
  `video.ts` (generate-story-video)
- `spikes/` — Phase 4 evidence; `flux-identity/photos/` is **gitignored**
  (family photos never leave the machine)
- `.claude/projects/.../memory/` — session memory for the AI assistant
