# To Posterity — Design System Overview

A complete inventory of the current visual system, what's working, and what isn't. Use this as the foundation for a proper redesign.

---

## 1. Brand Foundation

### Name
**To Posterity** — drawn from Petrarch's 1350 letter *Ad Posteros* ("to those who come after, whoever you turn out to be"). The conceit is that every recording is a sealed letter addressed to readers centuries from now.

### Core metaphor
The **wax seal** is the central brand object. Pressing the record button = sealing a letter. The heir opening a story (future feature) = breaking the seal. The seal mark recurs throughout — favicon, footer, large record button, planned share artifacts.

### Tone
Editorial. Reverent. Plainspoken in product copy (Bumper Test). Latinate and ceremonial in marketing copy. Never twee.

### Domain
`toposterity.ai` (Vercel preview at `story-vault-umber.vercel.app`)

---

## 2. Color System

### Light mode (default)

| Token | OKLCH | Hex (~) | Usage |
|-------|-------|---------|-------|
| `--background` | `0.97 0.008 80` | `#F5F0EB` | Page background — warm parchment |
| `--foreground` | `0.15 0.02 55` | `#2D2418` | Body text, headings |
| `--card` | `0.99 0.005 80` | `#FBF8F4` | Cards, alternating sections |
| `--primary` | `0.38 0.12 20` | `#6B2222` | Deep burgundy wine — buttons, links, brand |
| `--primary-foreground` | `0.97 0.005 80` | `#F8F1E7` | Text on primary |
| `--muted-foreground` | `0.23 0.02 55` | `#3D3028` | Secondary text |
| `--border` | `0.88 0.015 75` | `#DBD2C5` | Hairline dividers |
| `--gold` | `0.72 0.12 85` | `#C39B47` | Light gold accent |
| `--gold-dark` | `0.45 0.14 75` | `#735000` | Section labels, ornaments |
| `--destructive` | `0.55 0.22 27` | `#C13030` | Errors |

### Dark mode
Inverted scale — `--background` becomes near-black warm brown, `--primary` shifts to lighter gold-amber. Implemented via `next-themes`. Currently functional but **undertested visually**.

### What works
- The wine + parchment + gold triad is distinctive
- High contrast on body text (0.23 muted vs 0.97 bg = WCAG AAA)
- Gold-dark for labels reads as "category tag" not "decoration"

### What's weak
- No tertiary accent — everything is wine, gold, or muted
- No semantic colors for success/info — only destructive exists
- Card background (0.99) is barely distinguishable from page background (0.97). Section alternation is hard to see.

---

## 3. Typography

### Font families
- **IM Fell English** (italic, 400) — `--font-logo` — logo wordmark only ("To Posterity")
- **Cinzel** (400-700) — `--font-heading` — all H1/H2/H3, button labels, section tags
- **Cormorant Garamond** (300-700) — `--font-body` — body paragraphs, blockquotes, descriptions
- **Geist Mono** — code blocks (rarely used)

### Type scale (at 20px base)

| Element | Size | Where |
|---------|------|-------|
| `.display` | 60-80px | Marketing hero H1 only (home, vision) |
| `h1` | 40-48px | Page titles |
| `h2` | 32-40px | Section headings |
| `h3` | 24px | Card titles |
| `.stat` | 40px | Big numbers (stats, prices) |
| `.quote` | 28-32px italic | Pull quotes |
| `.lead` | 24px | Hero subheads, emphasis paragraphs |
| `p` (default) | 20px | Body |
| `.label` | 18px tracked uppercase | Gold category tags |

Defined once in `globals.css` under `@layer base` and below. JSX uses bare `h1`/`h2`/`h3`/`p` tags — no Tailwind `text-Nxl` overrides.

### What works
- Single source of truth for sizes
- Cinzel for headings reads as "Roman inscription" — fits the legacy concept
- IM Fell English italic on the logo is distinctive and period-correct

### What's weak
- **Hierarchy is mushy**: `.lead` (24px) and `h3` (24px) are the same size, only differing in semantic meaning. Visually indistinguishable.
- **H1 vs H2 on mobile is too close** (40px vs 32px = 1.25 ratio) — sections don't feel like clear breaks
- **Body line-height (1.7) is generous** but combined with 20px base creates a lot of vertical air — pages feel "long" without earning it
- Cinzel + Cormorant are both serifs of similar weight — there's no sans-serif anchor to create contrast (no "shouting" typography against "whispering" typography)

---

## 4. Brand Elements

### Wax seal (✓ working)
Pure CSS component (`components/WaxSeal.tsx`).
- Radial gradient (lighter warm wine top-left → darker bottom-right)
- Inner embossed ring
- Drip at bottom (pseudo-element)
- Texture via layered gradients

Used:
- Favicon (`app/icon.svg`) — simplified, 64×64
- Footer (small, with "TP" monogram, 56px)
- Record button (large, with mic icon, 176px)
- OG image (`app/opengraph-image.tsx`) — flat version

### Gold ornaments
Three styles, all in JSX inline:
1. Horizontal divider with center dot (used between sections)
2. Vertical thin line (decorative element near hero)
3. Gold-dark uppercase tracked labels (`.label` class)

### Decorative gold rings around record button
Two concentric `border border-gold/20` rings — supposed to read as "paper edge" surrounding the seal.

### What works
- Wax seal as a recurring motif
- Gold dot-dash-dot divider has a nice editorial feel

### What's weak
- **The wax seal motif doesn't show up enough.** It's the brand and it only appears 3 places. Should be on cards, on transition states, on completion confirmations, etc.
- Gold ornaments feel decorative-only — no functional purpose. Could be load indicators, dividers between content sections, etc.
- No paper/parchment texture anywhere — the background is flat color. A subtle paper grain would tie the wax seal into a coherent world.
- No envelope iconography anywhere despite the metaphor

---

## 5. Layout System

### Page widths
- Marketing pages (`/`, `/vision`): `max-w-5xl` (1024px) for content, `max-w-3xl` for prose, `max-w-2xl` for CTAs
- App pages: `max-w-3xl` for detail views, full-bleed for list views
- Header/footer: `max-w-6xl` (1152px)

### Vertical rhythm
- Marketing sections: `py-24` (96px top/bottom), hero is `py-28 md:py-40`
- App pages: `py-8` (32px)

### Section alternation
Marketing pages alternate `bg-card` and default `bg-background`. Because the colors are nearly identical (0.97 vs 0.99 lightness), this **does not read as alternating sections** — the visual rhythm is lost.

### Grid usage
- Step cards: `grid md:grid-cols-3`
- Feature cards: `grid gap-1 sm:grid-cols-2 lg:grid-cols-3`
- Pricing: `grid md:grid-cols-2 lg:grid-cols-4` with `bg-border` between cards (hairline grid)
- Stat cards: `grid sm:grid-cols-3`

### What works
- The hairline-grid pricing card layout is clean
- Max-w-3xl prose width is readable

### What's weak
- **No clear vertical rhythm between elements within a section** — heading, sub-label, paragraph, button all use ad-hoc `mb-X` values
- Section alternation fails visually (see above)
- Hero sections are tall and empty — the focal point (wordmark) floats in space without supporting structure
- Cards are all the same flat shape: `rounded-lg border border-border bg-card`. No variation.

---

## 6. Components

### Buttons (`components/ui/button.tsx`)
Variants: `default` (burgundy), `outline`, `secondary`, `ghost`, `destructive`, `link`
Sizes: `xs` (h-7), `sm` (h-9), `default` (h-10), `lg` (h-14), `xl` (h-16)

### Cards
No reusable Card component beyond what shadcn provides. Pages use inline `rounded-lg border border-border bg-card p-X` patterns ad-hoc. **No consistent card system.**

### Wax seal
See section 4.

### Logo (`components/Logo.tsx`)
Wordmark in IM Fell English italic. Sizes: `sm` (text-2xl), `md` (text-3xl), `lg` (text-5xl md:text-6xl), `xl` (text-6xl md:text-7xl lg:text-8xl).

### Header (`components/layout/Header.tsx`)
Sticky, transparent backdrop-blur, max-w-6xl. Logo left, nav right. Mobile: hamburger menu.

### Footer (`components/layout/Footer.tsx`)
Wax seal (56px) + logo + tagline on left, nav links on right. Adds `pb-24` on app pages to clear bottom nav.

### Bottom Nav (`components/layout/BottomNav.tsx`)
App-only, 5 items: Record / Stories / Collections / Family / Settings. Icon + label, fixed bottom.

### Accessibility Widget (`components/layout/AccessibilityWidget.tsx`)
Floating 40px button top-right (below header). Opens 320px panel with Light/Dark, font size slider (16-32px), line-height slider (1.4-2.4), reset button. Persisted via Zustand to localStorage.

### What works
- Buttons have proper accessibility sizes (h-14 for primary CTAs)
- Wax seal is genuinely a custom-built component, not a stock asset

### What's weak
- **No design language for cards** — every card is `border border-border bg-card p-5 rounded-lg`. They all look the same regardless of content type (recording vs story vs collection vs voice prompt).
- **No empty states with personality** — "No stories yet" is a generic icon + heading + paragraph. Could be designed around the letter metaphor (an empty envelope, a wax-sealed-but-blank scroll, etc.)
- **Loading states are missing** — only the Loader2 spinner exists. No skeleton screens, no thematic loading.
- **No transitions/animations** — pages snap into existence. The wax seal could "press" on hover. Section reveals could be subtle.
- Bottom nav is dense (5 items) — labels are tight at `text-base`

---

## 7. Pages

### Public

**Home (`/`)** — Hero with logo + tagline, How It Works (3 steps), Features (6 cards), Bumper Test quote, CTA section.

**Vision (`/vision`)** — Hero, Problem (4 cards), Solution (4 process steps), Key Features (5 sections with bullet lists), Audience (3 cards), Design Philosophy (4 cards), The Name (Petrarch paragraph), Origin (Bumper paragraphs), Market (stats + text), Pricing (4 cards), CTA.

The Vision page is long — 10+ distinct sections. It's a wall of similarly-structured content blocks.

### Auth
**Login / Signup** — Centered, max-w-sm cards on full-screen parchment background. Header shows logo only (no nav). Email/password + Google OAuth. Email confirmation flow with branded template.

### App

**Record (`/record`)** — Centered layout. Big wax seal record button. Status text above when idle, timer + waveform when recording. No header chrome.

**Stories (`/stories`)** — List view. Each item is a card (story or unprocessed recording). Voice clone prompt banner appears at 5min and 30min thresholds. Empty state.

**Stories detail (`/stories/[id]`)** — Reading view for generated story. Title + meta + themes + summary blockquote + audio player + prose content + character list + collapsible original transcription. Also handles unprocessed recordings with a simpler view.

**Collections (`/collections`)** — List of 6 default + custom collections. Each item shows icon, name, description, recording count. Dialog to create new.

**Collection detail (`/collections/[id]`)** — Add/remove recordings from a collection. Dialog to pick from available recordings.

**Family (`/family`)** — Empty placeholder. Not yet built.

**Settings (`/settings`)** — Display name + email + sign out. Minimal.

---

## 8. What's Honestly Working

1. **Brand concept** — "To Posterity" + Petrarch + letter metaphor is strong and differentiating
2. **Wax seal** as a custom visual mark — distinctive, feels owned
3. **Color palette** — wine, parchment, gold is rare and editorial
4. **The full AI pipeline** — Deepgram → Claude → ElevenLabs works end-to-end
5. **Direct browser → Supabase Storage** uploads (bypassing Vercel size limits)
6. **Voice clone flow** with 5min/30min milestone prompts
7. **Per-user voice preference** picker before first audio generation
8. **Stories page** showing both transcribed recordings AND generated stories cleanly

---

## 9. What's Honestly Weak

### Visual design
1. **No real hierarchy** — h1, h2, h3, lead, stat all hover around 24-40px. Pages feel flat.
2. **Cards are all the same** — no visual differentiation between story cards, recording cards, collection cards, prompt banners
3. **Section alternation broken** — bg-card and bg-background look identical
4. **No motion / no life** — everything is static
5. **Hero sections are vast and empty** — wordmark floats in 200px of whitespace without supporting structure
6. **Decorative elements feel decorative** — gold dividers, vertical lines, rings around the seal — none of them carry information
7. **The wax seal motif is underused** — three appearances, when it should be everywhere
8. **Empty states are generic** — no envelopes, no scrolls, no letters in any of them
9. **No paper/parchment texture** — flat color doesn't sell the "letter" concept
10. **Vision page is a wall of sameness** — 10+ sections, all similarly structured

### UX
1. **Accessibility widget reliability is questionable** — user reports it feels random / partial
2. **No onboarding flow** — first-time user lands at /record with no context
3. **No success/completion celebration** — finishing a recording, generating a story, hitting milestones all use the same toast pattern
4. **No clear navigation between collections and stories** — they're parallel but unconnected concepts

### Information architecture
1. **Stories page mixes two concepts**: generated stories and raw recordings live together in one list with subtle styling differences
2. **Collections has no overview** of what stories are in it — you have to click in
3. **No search / filter** on any list view
4. **Vision page tries to do too much** — pitch + features + audience + market + pricing + origin all on one page

### Brand consistency
1. **Letter / envelope visual language is missing** — the metaphor lives only in copy, not visuals
2. **Wax seal should appear on completion states** — sealed scroll for a finished story, broken seal for a delivered letter
3. **No marketing imagery / illustrations** — pages are all type + chrome, no visual content

---

## 10. Tech Stack (for reference)

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + custom CSS layer
- **Components**: shadcn/ui (subset)
- **State**: Zustand (accessibility prefs, recording state)
- **Auth + DB + Storage**: Supabase (Postgres with RLS, Auth, Storage buckets)
- **Transcription**: Deepgram Nova-2
- **LLM**: Anthropic Claude (Sonnet 4)
- **TTS**: ElevenLabs (stock voices + instant voice cloning)
- **Email**: Supabase Auth + custom HTML template
- **Hosting**: Vercel
- **Theming**: next-themes (light/dark)

---

## 11. Recommendations for Redesign

Suggested priorities if rebuilding the design system:

### Tier 1 — High-impact, low-effort
1. **Stronger H1** — push hero/marketing H1 to 64-80px, make it dominate
2. **Card hierarchy** — design 3-4 distinct card types (story, recording, collection, prompt) with different visual treatments
3. **Section backgrounds** — replace bg-card vs bg-background with a more visible difference (deeper parchment vs ivory, or use texture)
4. **Empty states** — design envelope/scroll/seal versions for each
5. **Section dividers** — instead of `bg-card` alternation, use ornamental dividers between sections

### Tier 2 — Higher effort, big payoff
1. **Paper texture** as a subtle background layer
2. **Animation system** — wax seal press effect, page transitions, completion celebrations
3. **Iconography library** — letter, envelope, scroll, quill, ink, wax — replace generic Lucide icons where the metaphor allows
4. **Hero illustration** — actual envelope or sealed letter as a hero visual
5. **Onboarding flow** — guided first-recording experience

### Tier 3 — Strategic
1. **Brand book / style guide** as a maintained document
2. **Component library doc** in Storybook or similar
3. **Marketing imagery** — photos of older adults, letters, family — to ground the abstract concept

---

*This document reflects the system as of 2026-04-24. Update as the design evolves.*
