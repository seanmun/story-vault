import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Changelog — To Posterity",
  description: "Version history and notable changes.",
};

const versions: {
  version: string;
  date: string;
  changes: string[];
}[] = [
  {
    version: "0.0.4",
    date: "May 2026",
    changes: [
      "Rebrand from StoryVault to To Posterity, drawn from Petrarch's 1350 letter Ad Posteros",
      "Wax seal motif as the core brand object",
      "IM Fell English wordmark + Cinzel headings + Cormorant Garamond body",
      "Editorial design pass: paper texture, drop caps, pull-quotes",
      "Accessibility widget — Normal / Big / Bigger text presets, light/dark mode",
      "Auth-aware header with user avatar dropdown",
      "Delete recordings and add to multiple collections from Stories page",
      "Beta pricing — Free tier highlighted, paid tiers shown as preview",
      "Branded confirmation email and OG image",
    ],
  },
  {
    version: "0.0.3",
    date: "April 2026",
    changes: [
      "ElevenLabs audio narration for every story",
      "Voice preference picker (Male / Female stock voices)",
      "Voice cloning at 5 minutes recorded, enhanced clone at 30 minutes",
      "Collections — group recordings into themed narratives (many-to-many)",
      "Direct browser-to-Supabase Storage uploads, no more size limits",
    ],
  },
  {
    version: "0.0.2",
    date: "April 2026",
    changes: [
      "Claude story generation — raw transcriptions become polished memoir prose",
      "Automatic theme, character, time period, and life chapter extraction",
      "Stories list and reading view with original transcription toggle",
      "10-minute max recording duration with countdown",
    ],
  },
  {
    version: "0.0.1",
    date: "April 2026",
    changes: [
      "Voice recording with live waveform and pause/resume",
      "Deepgram Nova-2 transcription tuned for older voices",
      "Supabase auth (email + Google), Postgres + RLS, audio storage",
      "Marketing pages, app shell, bottom navigation",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="paper-texture">
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <p className="label text-gold-dark mb-3">Changelog</p>
        <h1 className="mb-12">Version History</h1>

        <div className="space-y-12">
          {versions.map((v) => (
            <article key={v.version}>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="font-heading text-foreground" style={{ fontSize: "1.4em" }}>
                  v{v.version}
                </h2>
                <span className="text-muted-foreground italic">{v.date}</span>
              </div>
              <ul className="space-y-2 list-disc pl-6 marker:text-gold-dark">
                {v.changes.map((change, idx) => (
                  <li key={idx} className="text-foreground/85 pl-1">
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <Link href="/">
            <Button variant="outline" className="tracking-wide">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
