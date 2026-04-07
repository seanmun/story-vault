# StoryVault — Technical Plan

**React / TypeScript / Next.js Architecture**
*Feature-Rich MVP*

Voice Recording · AI Story Engine · Multi-Format Output · Family Sharing

Prepared for Sean Munley | April 2026 | CONFIDENTIAL

---

## 1. Technology Stack

The MVP is built as a Next.js 14+ App Router project with TypeScript throughout. This gives us a React frontend, serverless API routes for the AI pipeline, and easy deployment on Vercel. Supabase provides authentication, a Postgres database, real-time subscriptions, and S3-compatible object storage for audio files.

### 1.1 Core Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | React SSR/SSG, API routes, middleware, image optimization. App Router for layouts and streaming. |
| Language | TypeScript 5+ | Type safety across frontend and backend. Shared types for API contracts. |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with accessible, customizable component primitives. Fast iteration. |
| State Management | Zustand + TanStack Query | Zustand for client state (recording UI). TanStack Query for server state (stories, user data). |
| Auth + Database | Supabase (Auth + Postgres) | Email/OAuth auth, row-level security, real-time subscriptions, full Postgres with migrations. |
| File Storage | Supabase Storage (S3) | Audio file storage with signed URLs, access policies, and CDN delivery. |
| AI Orchestration | Vercel AI SDK | Provider-agnostic streaming. Swap between OpenAI, Anthropic, etc. with one line change. |
| Transcription | Deepgram / Whisper | Abstracted behind interface. Deepgram for speed, Whisper for accuracy. User-configurable. |
| Deployment | Vercel | Zero-config Next.js deployment, edge functions, analytics, preview deploys per PR. |
| Testing | Vitest + Playwright | Vitest for unit/integration tests. Playwright for E2E (critical for accessibility testing). |

### 1.2 Why This Stack

Three key decisions drove the stack selection. First, Next.js App Router lets us colocate API routes with the pages that call them, meaning the recording page and its transcription endpoint live in the same directory. When we migrate to mobile later, we extract the API routes into a standalone Express or Fastify server with minimal refactoring. Second, Supabase gives us Postgres (not a toy database) with row-level security policies, meaning we can enforce that users only see their own stories and family members see shared stories at the database level, not just in application code. Third, the Vercel AI SDK provides a clean abstraction over multiple LLM providers, so we never hard-code ourselves to OpenAI or Anthropic. The AI provider becomes a configuration choice, not an architecture choice.

---

## 2. Project Structure

The project follows Next.js App Router conventions with a feature-based organization inside the app directory. Shared logic lives in `lib/` and reusable UI components in `components/`.

```
storyvault/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── record/page.tsx          # The Big Button
│   │   ├── stories/
│   │   │   ├── page.tsx              # Story library
│   │   │   └── [id]/page.tsx         # Single story view
│   │   ├── family/page.tsx          # Family sharing
│   │   ├── settings/page.tsx        # Account + legacy
│   │   └── layout.tsx               # App shell + nav
│   ├── api/
│   │   ├── recordings/
│   │   │   ├── upload/route.ts       # Upload audio
│   │   │   └── [id]/route.ts         # Get/delete recording
│   │   ├── stories/
│   │   │   ├── generate/route.ts     # Trigger AI pipeline
│   │   │   ├── [id]/route.ts         # CRUD story
│   │   │   └── [id]/export/route.ts  # Export formats
│   │   ├── transcribe/route.ts       # Transcription endpoint
│   │   ├── family/
│   │   │   ├── invite/route.ts       # Send invite
│   │   │   └── members/route.ts      # List/manage family
│   │   └── webhooks/
│   │       └── supabase/route.ts     # Auth + DB webhooks
│   ├── layout.tsx                    # Root layout
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── recording/
│   │   ├── RecordButton.tsx          # The Big Button component
│   │   ├── RecordingControls.tsx     # Pause/stop/discard
│   │   ├── AudioWaveform.tsx         # Live waveform visual
│   │   └── RecordingTimer.tsx        # Duration display
│   ├── stories/
│   │   ├── StoryCard.tsx             # Story preview card
│   │   ├── StoryReader.tsx           # Full story view
│   │   ├── StoryPlayer.tsx           # Audio playback
│   │   └── ExportMenu.tsx            # Format export options
│   ├── family/
│   │   ├── FamilyMemberList.tsx
│   │   ├── InviteModal.tsx
│   │   └── SharedStoryFeed.tsx
│   └── layout/
│       ├── AppShell.tsx              # Main layout wrapper
│       ├── BottomNav.tsx             # Mobile-first nav
│       └── AccessibilityControls.tsx # Font size, contrast
├── lib/
│   ├── ai/
│   │   ├── provider.ts               # AI provider abstraction
│   │   ├── transcription.ts          # Transcription interface
│   │   ├── story-generator.ts        # Written story generation
│   │   ├── podcast-generator.ts      # Podcast episode generation
│   │   ├── notebook-prompt.ts        # AI notebook prompt builder
│   │   └── prompts/
│   │       ├── story-enhance.ts      # Story enhancement prompt
│   │       ├── theme-extract.ts      # Theme/character extraction
│   │       └── podcast-script.ts     # Podcast script prompt
│   ├── audio/
│   │   ├── recorder.ts               # Browser MediaRecorder wrapper
│   │   ├── waveform.ts               # Audio visualization
│   │   └── compress.ts               # Client-side compression
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   ├── middleware.ts              # Auth middleware
│   │   └── types.ts                  # Generated DB types
│   ├── hooks/
│   │   ├── useRecorder.ts            # Recording state machine
│   │   ├── useStories.ts             # Story CRUD hooks
│   │   ├── useFamily.ts              # Family management hooks
│   │   └── useAccessibility.ts       # A11y preference hooks
│   ├── stores/
│   │   ├── recording-store.ts        # Zustand recording state
│   │   └── ui-store.ts               # UI preferences
│   └── types/
│       ├── story.ts                  # Story types
│       ├── recording.ts              # Recording types
│       ├── user.ts                   # User/family types
│       └── ai.ts                     # AI provider types
├── supabase/
│   ├── migrations/                   # SQL migrations
│   ├── seed.sql                      # Dev seed data
│   └── config.toml                   # Supabase config
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Database Schema

All tables live in Supabase Postgres with row-level security (RLS) policies. The schema is designed around four core entities: users, recordings, stories, and family groups. Every table includes `created_at` and `updated_at` timestamps managed by triggers.

### 3.1 Entity Relationship Overview

A User has many Recordings. Each Recording can produce one Story (with multiple output formats). Users belong to Family Groups, which control sharing. The Designated Heirs table manages succession planning.

### 3.2 Core Tables

#### profiles

Extends Supabase `auth.users` with app-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK) | References auth.users(id). Set on signup trigger. |
| display_name | text | User's display name (e.g., "Bumper") |
| avatar_url | text \| null | Profile photo URL |
| date_of_birth | date \| null | For timeline features |
| bio | text \| null | Short bio shown on shared stories |
| accessibility_prefs | jsonb | { fontSize, highContrast, reducedMotion } |
| subscription_tier | enum | free \| storyteller \| family_legacy \| legacy_forever |
| onboarding_complete | boolean | Has completed first recording |
| last_active_at | timestamptz | For inactivity detection (succession) |

#### recordings

Raw audio files uploaded by the user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK) | References profiles(id) |
| storage_path | text | Path in Supabase Storage bucket |
| duration_seconds | integer | Recording length |
| file_size_bytes | bigint | For storage quota tracking |
| mime_type | text | audio/webm, audio/mp4, etc. |
| transcription | text \| null | Raw transcription text |
| transcription_meta | jsonb \| null | Word-level timestamps, confidence, speaker detection |
| status | enum | uploading \| uploaded \| transcribing \| transcribed \| failed |
| prompt_id | uuid \| null | Optional guided prompt that initiated this recording |

#### stories

AI-generated story content derived from recordings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| recording_id | uuid (FK) | References recordings(id) |
| user_id | uuid (FK) | References profiles(id) |
| title | text | AI-generated title, user-editable |
| written_content | text | Polished written narrative (Markdown) |
| summary | text | 2-3 sentence summary for cards |
| themes | text[] | Auto-extracted themes ["billiards", "hustle", "1980s"] |
| characters | jsonb | Named people mentioned [{ name, relationship, mentions }] |
| time_period | text \| null | Detected era ("1987", "late 1980s") |
| location | text \| null | Detected location ("Atlantic City, NJ") |
| life_chapter | enum | childhood \| youth \| career \| family \| adventures \| wisdom |
| podcast_script | text \| null | Generated podcast episode script |
| podcast_audio_path | text \| null | Generated podcast audio file path |
| notebook_prompt | text \| null | Pre-built prompt for NotebookLM/Claude |
| share_clip_path | text \| null | 60-second highlight clip path |
| visibility | enum | private \| family \| public |
| status | enum | generating \| ready \| failed |

#### family_groups

Links users into family units for shared access.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| name | text | Family name ("The Munley Family") |
| owner_id | uuid (FK) | Family Champion who manages the group |
| invite_code | text (unique) | Shareable code for joining |

#### family_members

| Column | Type | Description |
|--------|------|-------------|
| family_group_id | uuid (FK) | References family_groups(id) |
| user_id | uuid (FK) | References profiles(id) |
| role | enum | owner \| storyteller \| listener \| heir |
| relationship | text \| null | "son", "granddaughter", "spouse", etc. |

#### designated_heirs

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| owner_id | uuid (FK) | The storyteller granting access |
| heir_email | text | Heir's email (may not have account yet) |
| heir_user_id | uuid \| null | Linked when heir creates account |
| transfer_trigger | enum | inactivity \| manual \| date |
| inactivity_months | integer | Months of inactivity before transfer (default 24) |
| transfer_date | timestamptz \| null | Specific date for scheduled transfer |
| status | enum | pending \| notified \| transferred \| revoked |

---

## 4. AI Pipeline Architecture

The AI pipeline is the heart of StoryVault. It takes a raw audio recording and produces multiple output formats through a series of sequential and parallel processing stages. The pipeline is designed to be provider-agnostic, asynchronous, and fault-tolerant.

### 4.1 Pipeline Flow

The pipeline runs as a background job triggered after audio upload completes. Each stage updates the recording/story status in the database, and the frontend polls or subscribes via Supabase real-time to show progress.

**Stage 1 — Transcription:** The raw audio is sent to the transcription provider (Deepgram or Whisper via API). The provider returns text with word-level timestamps, confidence scores, and speaker detection. This stage takes 10-30 seconds for a typical 5-minute recording. The raw transcription is stored on the recording record.

**Stage 2 — Analysis:** The transcription is sent to the LLM for theme extraction, character identification, time period detection, location detection, and life chapter classification. This produces structured metadata that powers search, filtering, and cross-story connections. Runs in parallel with Stage 3.

**Stage 3 — Story Generation:** The transcription is sent to the LLM with a carefully crafted prompt that instructs it to transform the raw speech into a polished written narrative while preserving the storyteller's authentic voice, dialect, and personality. The prompt emphasizes keeping the storyteller's words and phrasing wherever possible while improving structure and readability. Runs in parallel with Stage 2.

**Stage 4 — Secondary Outputs (Async):** Once the written story is ready, secondary outputs are generated in parallel: a podcast script adapted from the written story, a NotebookLM/Claude prompt that embeds the full story context, and a 60-second highlight clip transcript. These are lower priority and can complete in the background.

**Stage 5 — Audio Generation (Optional):** If the user has enabled podcast output, the podcast script is sent to a TTS provider (ElevenLabs or similar) for narration. This is the most expensive and time-consuming stage, so it runs only on demand or for paid tiers.

### 4.2 Provider Abstraction

All AI interactions go through an abstract interface so providers can be swapped without touching business logic.

```typescript
// lib/ai/provider.ts
interface TranscriptionProvider {
  transcribe(audio: Buffer, opts: TranscribeOpts): Promise<Transcription>;
}

interface StoryProvider {
  generateStory(transcript: string, opts: StoryOpts): Promise<Story>;
  extractMetadata(transcript: string): Promise<StoryMetadata>;
  generatePodcastScript(story: string): Promise<string>;
  generateNotebookPrompt(story: string): Promise<string>;
}

// Swap providers with env vars:
// TRANSCRIPTION_PROVIDER=deepgram | whisper
// LLM_PROVIDER=anthropic | openai
```

### 4.3 Key Prompts

The story generation prompt is the most critical piece of IP in the application. It must balance enhancement with authenticity. The prompt instructs the LLM to preserve the storyteller's exact words for colorful expressions, slang, and memorable phrases, restructure for narrative flow without adding fictional events, maintain first-person perspective, add paragraph breaks and scene transitions, generate a compelling title, and flag any potential factual inconsistencies for user review.

The metadata extraction prompt runs on the same transcription but produces structured JSON output with themes (array of strings), characters (array of objects with name, inferred relationship, and number of mentions), detected time period, detected location, suggested life chapter category, and emotional tone.

---

## 5. Key Component Designs

### 5.1 The Big Button (RecordButton.tsx)

This is the most important UI element in the entire application. It dominates the home screen and must pass the Bumper Test. The component manages three states: idle (large, warm-colored circle with a microphone icon, gently pulsing), recording (expands slightly, turns to a warm red, shows a live waveform ring around the edge and a duration timer), and processing (shows a progress indicator with status text like "Transcribing your story..." then "Writing your story...").

The button is implemented as a state machine using Zustand. The recording itself uses the browser MediaRecorder API with a fallback to a Web Audio API implementation for older browsers. Audio is captured in chunks and streamed to a local buffer, then uploaded to Supabase Storage when recording stops.

```typescript
// lib/hooks/useRecorder.ts (simplified)
type RecorderState = 'idle' | 'recording' | 'paused' | 'uploading' | 'processing';

const useRecorder = () => {
  const [state, setState] = useState<RecorderState>('idle');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.start(1000); // 1s chunks for waveform
    setState('recording');
  };

  const stopRecording = async () => {
    mediaRecorder.current?.stop();
    setState('uploading');
    const blob = new Blob(chunks.current, { type: 'audio/webm' });
    await uploadAndProcess(blob);
    setState('processing');
  };

  return { state, startRecording, stopRecording, pauseRecording };
};
```

### 5.2 Story Library (stories/page.tsx)

The story library is a scrollable feed of StoryCards organized by life chapter. Each card shows the story title, a 2-line summary, themes as small tags, the recording date, and a play button for the original audio. Users can filter by life chapter, search by keyword, or sort by date. The library uses TanStack Query for infinite scroll pagination with Supabase cursor-based queries. Stories with visibility set to "family" show a small family icon badge.

### 5.3 Story View (stories/[id]/page.tsx)

The single story view has three tabs. The "Read" tab displays the polished written narrative with a comfortable reading layout (large text, generous line height, warm background). The "Listen" tab plays the original recording with a waveform player, or the AI-generated podcast episode if available. The "Share" tab provides export options: copy text, download as PDF, generate shareable link, export to NotebookLM, and send to family member. Each output format has a generation status indicator (ready, generating, or "Generate" button for formats not yet created).

### 5.4 Family Sharing (family/page.tsx)

The family page shows the user's family group with member avatars, a shared story feed from all family storytellers, and an invite mechanism. Invites are sent via email with a unique code. When a new member joins via invite, they are automatically added to the family group with the "listener" role. Storytellers can promote listeners to heirs. The family feed uses Supabase real-time subscriptions so new stories appear instantly for all family members.

---

## 6. Accessibility Strategy

Accessibility is not an afterthought for StoryVault. It is a core product requirement because the primary user base includes older adults who may have visual impairments, motor limitations, hearing loss, or reduced comfort with technology. The app must meet WCAG 2.1 AA standards at minimum, with AAA targets for critical flows.

- Minimum touch target size of 48x48px (we target 64x64px for primary actions like the Record button)
- Font sizes start at 18px minimum with user-adjustable scaling up to 32px via the accessibility controls
- Color contrast ratio of 7:1 for all text (AAA standard) with a high-contrast mode option
- All interactive elements have visible focus indicators that are at least 3px wide
- Screen reader optimized with proper ARIA labels, live regions for recording status, and semantic HTML throughout
- Reduced motion mode that disables the pulsing Record button animation and all transitions
- Hearing aid compatible audio playback with adjustable playback speed (0.5x to 2x)
- Keyboard navigation for all features with logical tab order
- Error messages are descriptive, persistent, and never rely solely on color to communicate state

Playwright E2E tests include automated accessibility audits (using axe-core) on every page and component. Any accessibility violation fails the CI build.

---

## 7. API Route Design

All API routes are Next.js Route Handlers in the `app/api/` directory. They use Supabase server client for auth verification and database access. Responses follow a consistent JSON envelope.

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/recordings/upload | Upload audio file, create recording record, trigger transcription |
| GET | /api/recordings/[id] | Get recording details + transcription status |
| DELETE | /api/recordings/[id] | Delete recording + storage file |
| POST | /api/transcribe | Manually trigger/retry transcription for a recording |
| POST | /api/stories/generate | Trigger full AI pipeline from recording ID |
| GET | /api/stories | List user's stories (paginated, filterable) |
| GET | /api/stories/[id] | Get full story with all output formats |
| PATCH | /api/stories/[id] | Update story (title, visibility, etc.) |
| POST | /api/stories/[id]/export | Generate specific output format (podcast, notebook, clip) |
| POST | /api/family/invite | Send family group invite via email |
| GET | /api/family/members | List family group members |
| POST | /api/family/join | Join family group with invite code |
| GET | /api/family/feed | Get shared stories from family members |

---

## 8. Implementation Roadmap

The MVP is broken into six two-week sprints, totaling roughly three months of development. Each sprint delivers a working, deployable increment.

### Sprint 1: Foundation (Weeks 1-2)

Set up the Next.js project with TypeScript, Tailwind, and shadcn/ui. Configure Supabase with auth (email + Google OAuth), database migrations for all core tables, and storage buckets. Build the app shell layout with bottom navigation, the auth pages (login, signup), and the basic profile/settings page. Deploy to Vercel with CI/CD via GitHub Actions. At the end of this sprint, users can sign up, log in, and see an empty app shell.

### Sprint 2: The Big Button (Weeks 3-4)

Build the recording system. Implement the RecordButton component with its state machine, the MediaRecorder integration, the live waveform visualization, and the audio upload flow to Supabase Storage. Wire up the transcription API endpoint with the provider abstraction (start with Deepgram). At the end of this sprint, users can record audio, see it transcribed, and view the raw transcription.

### Sprint 3: Story Engine (Weeks 5-6)

Build the AI story generation pipeline. Implement the story generation prompt, metadata extraction, and the story generation API endpoint. Build the story library page with StoryCards and the single story view with the Read tab. Wire up Supabase real-time for generation progress updates. At the end of this sprint, users can record a story and read the polished AI-generated written version.

### Sprint 4: Multi-Format Outputs (Weeks 7-8)

Add the secondary output formats. Implement podcast script generation, NotebookLM prompt generation, and shareable clip extraction. Build the Listen tab with audio player and the Share tab with export options. Add story editing capability (user can edit the AI-generated title and text). At the end of this sprint, the full multi-format output suite is functional.

### Sprint 5: Family Sharing (Weeks 9-10)

Build the family system. Implement family groups, invite flow, member management, and the shared story feed. Add visibility controls on stories. Build the designated heirs management in settings. Implement Supabase real-time subscriptions for the family feed. At the end of this sprint, families can share and view each other's stories.

### Sprint 6: Polish and Launch (Weeks 11-12)

Comprehensive accessibility audit and fixes. Performance optimization (lazy loading, image optimization, audio compression). Error handling and edge cases. Onboarding flow for first-time users. Analytics integration. Final E2E test suite. Launch to beta users.

---

## 9. Future Mobile Migration Path

The architecture is designed with mobile migration in mind. When the time comes, the path forward has three options, in order of recommendation.

**Option A — React Native with Shared Logic:** Extract the `lib/` directory (hooks, stores, AI pipeline, types) into a shared package. Build React Native screens that consume the same hooks and API layer. The Next.js API routes become a standalone Fastify or Express server deployed independently. This gives us native performance with maximum code reuse (estimated 60-70% shared code).

**Option B — Capacitor/Ionic Wrapper:** Wrap the existing Next.js web app in Capacitor for quick app store presence. Add native plugins for background audio recording, push notifications, and offline storage. Lower development cost but not truly native. Good as a bridge while building Option A.

**Option C — Progressive Web App:** The current web app already works on mobile browsers. Adding a PWA manifest, service worker for offline recording, and push notification support gets us 80% of native functionality with zero additional codebase. Best for validating mobile demand before investing in native development.

The recommended path is to launch with Option C (PWA) immediately for mobile access, then build Option A (React Native) once we have validated mobile usage patterns and have funding for native development.

---

## 10. Data Storage and Retrieval Strategy

A critical architecture question for StoryVault is how to store and retrieve potentially massive volumes of transcribed text. A prolific storyteller could record 100+ hours of audio, producing 600,000 to 900,000 words of text (roughly 4-6 MB). This section addresses whether Postgres alone is sufficient, or whether a vector database and RAG pipeline are needed.

### 10.1 The Math

People speak approximately 6,000-9,000 words per hour. 100 hours of recorded speech produces roughly 750,000 words or about 5 MB of raw text. In Postgres, this is trivial. Even at scale with 100,000 users each storing 100 hours, total text storage is approximately 500 GB, which is well within Postgres operational limits. Audio files are the real storage cost (100 hours of compressed audio is roughly 3-6 GB per user), but those live in Supabase Storage (S3), not the database.

| Metric | Per Hour | 100 Hours | 100K Users |
|--------|----------|-----------|------------|
| Words | ~7,500 | ~750,000 | 75 billion |
| Text size | ~50 KB | ~5 MB | ~500 GB |
| Audio size (compressed) | ~40 MB | ~4 GB | ~400 TB |
| LLM tokens | ~10,000 | ~1,000,000 | N/A (per-user) |

### 10.2 Three-Tier Retrieval Architecture

Rather than defaulting to a full RAG pipeline for every user, StoryVault uses a tiered approach that matches retrieval complexity to the actual use case. Most interactions never need vector search at all.

#### Tier 1: Direct Database Queries (80% of use cases)

For browsing the story library, reading a single story, sharing with family, filtering by theme or life chapter, and keyword search, a standard Postgres query with indexes on `user_id` is all that is needed. Postgres full-text search using `tsvector` and `tsquery` handles keyword search across all of a user's stories with sub-millisecond response times. We add a GIN index on the `written_content` and `transcription` columns for instant full-text search.

```sql
-- Migration: Add full-text search indexes
ALTER TABLE stories ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(written_content, '')), 'C')
  ) STORED;

CREATE INDEX idx_stories_search ON stories USING GIN (search_vector);
CREATE INDEX idx_stories_user_chapter ON stories (user_id, life_chapter);
CREATE INDEX idx_stories_themes ON stories USING GIN (themes);
```

#### Tier 2: Smart Context Assembly (15% of use cases)

When a user wants to generate a multi-story output, such as compiling stories into a book, creating an AI notebook prompt covering their whole life, or asking a question that spans multiple stories, we use smart context assembly rather than vector search. This approach leverages the pre-computed summaries and metadata already stored on each story record.

The process works as follows. First, load all of the user's story summaries and metadata (themes, characters, time periods). For a user with 100 hours of recordings, this is roughly 200 stories with summaries totaling about 50,000 tokens. Then, use the LLM to select which stories are most relevant to the user's request based on the summaries. Finally, load the full text of only the selected stories (typically 5-20 stories) and send those plus the summaries to the LLM for generation.

Claude's 200K token context window can hold approximately 150,000 words, which means we can fit all summaries plus the full text of 15-20 stories in a single request. This covers virtually every multi-story generation scenario without any vector infrastructure.

```typescript
// lib/ai/context-assembler.ts (simplified)
async function assembleContext(userId: string, task: string) {
  // Step 1: Load all summaries (fast, ~50K tokens for heavy user)
  const allStories = await supabase
    .from('stories')
    .select('id, title, summary, themes, characters, time_period, life_chapter')
    .eq('user_id', userId);

  // Step 2: LLM selects relevant stories
  const relevant = await llm.chat({
    messages: [{
      role: 'user',
      content: `Given these story summaries, select the IDs most
               relevant to: "${task}"\n${JSON.stringify(allStories)}`
    }]
  });

  // Step 3: Load full text of selected stories only
  const fullStories = await supabase
    .from('stories')
    .select('*')
    .in('id', relevant.selectedIds);

  return { summaries: allStories, fullStories };
}
```

#### Tier 3: Per-User Vector Search (5% of use cases, added later)

For truly open-ended conversational queries across a massive story archive, such as a grandchild asking "What did grandpa think about taking risks?" across 500 stories, vector search becomes valuable. The key advantage of our architecture is that Supabase natively supports this via the `pgvector` extension, so we do not need a separate vector database service.

When this tier is needed, we add a `story_chunks` table that breaks each story into 500-token overlapping passages, generates embeddings via OpenAI or Cohere, and stores them alongside the text. Queries combine vector similarity search with a `user_id` filter, ensuring each user only searches their own stories. This is a database migration and a new table, not a new service or infrastructure component.

```sql
-- Migration: Add vector search (when needed)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE story_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  chunk_index integer,
  content text NOT NULL,
  embedding vector(1536),  -- OpenAI ada-002 dimensions
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chunks_embedding ON story_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_chunks_user ON story_chunks (user_id);

-- Query: Find relevant chunks for a user's question
SELECT content, story_id, 1 - (embedding <=> $1) AS similarity
FROM story_chunks
WHERE user_id = $2
ORDER BY embedding <=> $1
LIMIT 20;
```

### 10.3 Export and AI Generation Strategy

When users want to export their stories for use in external AI tools (NotebookLM, Claude Projects, ChatGPT), the data needs to be packaged efficiently. The export pipeline generates a structured document containing a master index of all stories with metadata, full text of selected or all stories organized by life chapter, a character registry with cross-references, and a timeline of events. This export is formatted as Markdown for maximum compatibility with AI tools, and can also be rendered as PDF or DOCX for traditional reading.

For the NotebookLM integration specifically, the export includes a pre-written system prompt that instructs the AI on the storyteller's identity, speaking style, key themes, and family relationships, so that anyone conversing with the notebook feels like they are talking to the storyteller's memories directly.

### 10.4 MVP Implementation

For the MVP, we implement Tier 1 (full-text search with Postgres indexes) and Tier 2 (smart context assembly). This requires zero additional infrastructure beyond what is already in the tech stack. Tier 3 (pgvector) is designed and migration-ready but not deployed until user behavior data shows demand for open-ended conversational search. The estimated effort to add Tier 3 later is one sprint (two weeks), since it is just a migration, a chunking job, and an embedding generation pipeline.

---

## 11. Environment Variables

All sensitive configuration is managed through environment variables, never committed to source control.

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers (swap by changing PROVIDER vars)
TRANSCRIPTION_PROVIDER=deepgram    # deepgram | whisper
LLM_PROVIDER=anthropic             # anthropic | openai

# Deepgram
DEEPGRAM_API_KEY=...

# OpenAI (Whisper + GPT)
OPENAI_API_KEY=sk-...

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# ElevenLabs (TTS for podcast)
ELEVENLABS_API_KEY=...

# Email (invites, notifications)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://storyvault.app
```

---

*Ready to build.*
