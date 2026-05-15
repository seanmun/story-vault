import Script from "next/script";
import Link from "next/link";
import {
  Mic,
  BookOpen,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaxSeal } from "@/components/WaxSeal";

export default function VisionPage() {
  return (
    <div className="paper-texture">
      {/* Hero */}
      <section className="px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="label text-gold-dark mb-8">Our Vision</p>
          <h1 className="display mb-10">
            Stories Are Dying
            <br />
            <span className="text-primary italic font-body font-light">
              with the people
            </span>
            <br />
            Who Lived Them
          </h1>
          <p className="lead mx-auto max-w-2xl text-muted-foreground">
            Every day, irreplaceable stories disappear. The veteran who never
            wrote about the war. The grandmother whose recipes kept a family
            alive. Once the storytellers are gone, the stories go with them.
          </p>

          {/* ElevenLabs AudioNative Player */}
          <div className="mt-14 w-full max-w-2xl mx-auto">
            <div
              id="elevenlabs-audionative-widget"
              data-height="90"
              data-width="100%"
              data-frameborder="no"
              data-scrolling="no"
              data-publicuserid="cc0bdceaefc0a9d96ec8f2ecf3476f85bbee8b2b3e1f7030edf789f1b258a24b"
              data-playerurl="https://elevenlabs.io/player/index.html"
            >
              Loading the{" "}
              <a
                href="https://elevenlabs.io/text-to-speech"
                target="_blank"
                rel="noopener"
              >
                Elevenlabs Text to Speech
              </a>{" "}
              AudioNative Player...
            </div>
            <Script
              src="https://elevenlabs.io/player/audioNativeHelper.js"
              strategy="lazyOnload"
            />
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* The Name — Petrarch (now elevated to second section) */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <div className="mb-10 flex justify-center">
              <WaxSeal size={88} monogram="TP" />
            </div>
            <p className="label text-gold-dark mb-4">The Name</p>
            <h2>Ad Posteros</h2>
          </div>

          <blockquote className="pull-quote text-foreground/85 mb-10 pl-8 md:pl-12">
            In 1350, Petrarch sat down and wrote a letter. He didn&apos;t know
            who would read it. He addressed it simply: To Posterity &mdash;
            to whoever came after, whoever they turned out to be.
          </blockquote>

          <p className="lead text-muted-foreground">
            Seven hundred years later, people still read it. This is that
            same letter. Except now you get to speak it, and the person
            who opens it is someone you love.
          </p>
        </div>
      </section>

      <SectionBreak />

      {/* Origin — Bumper */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <p className="label text-gold-dark mb-4">Origin</p>
            <h2>Why This Exists</h2>
          </div>
          <div className="space-y-6 text-muted-foreground">
            <p className="drop-cap text-foreground">
              Bumper was a billiards hustler. Not the kind you see in movies,
              standing silently in a dark corner waiting to reveal his hidden
              talent. Bumper was loud, colorful, and impossible to ignore.
            </p>
            <p>
              His skill was not just running the table. It was reading people,
              getting them to bet more than they should, and putting them on
              tilt with his personality before they ever picked up a cue. He
              played against legends of the game. His friends back up every
              story. Witnesses confirm them.
            </p>
            <p>
              But Bumper is never going to write a book. He is never going to
              sit down with a laptop and type out his memoirs. He would,
              however, sit in his living room and talk about the time he
              hustled a guy out of $5,000 in a bar in New Jersey. He would
              talk for an hour about the characters he met, the close calls,
              the lessons learned. All you have to do is ask him and hand him
              a microphone.
            </p>

            <div className="py-6">
              <div className="section-ornament">
                <span className="section-ornament-dot" />
              </div>
            </div>

            <p className="lead text-foreground font-medium">
              That is why this exists. The world is full of Bumpers. People
              with extraordinary lives and extraordinary stories who will
              never become authors. The technology now exists to meet them
              exactly where they are: in conversation.
            </p>
            <p className="italic">
              Two hundred years from now, Bumper&apos;s
              great-great-great-grandchildren should be able to hear his
              voice, read his stories, and know exactly what kind of man he
              was.
            </p>
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* How It Works — vertical timeline */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-20">
            <p className="label text-gold-dark mb-4">The Process</p>
            <h2>How It Works</h2>
            <p className="lead mt-6 text-muted-foreground max-w-2xl mx-auto">
              A voice-first platform built around one action: press a button
              and start talking. Everything else happens automatically.
            </p>
          </div>

          <ol className="relative">
            {/* Vertical line */}
            <div
              aria-hidden="true"
              className="absolute left-7 top-7 bottom-7 w-px bg-gold/30"
            />

            <TimelineStep
              roman="I"
              title="Record"
              description="Open the app and tap the big, unmissable Record button. Tell your story in your own words. No prompts required."
              icon={<Mic className="h-5 w-5" />}
            />
            <TimelineStep
              roman="II"
              title="AI Processes"
              description="Your recording is transcribed and analyzed. AI identifies themes, characters, time periods, and emotional arcs."
              icon={<Sparkles className="h-5 w-5" />}
            />
            <TimelineStep
              roman="III"
              title="Multi-Format Output"
              description="Your story becomes polished written prose, a podcast-style audio episode, and a shareable clip — all in your voice."
              icon={<BookOpen className="h-5 w-5" />}
            />
            <TimelineStep
              roman="IV"
              title="Organize & Share"
              description="Stories organize into life chapters. Share with family, and over time your collection becomes a complete memoir."
              icon={<Users className="h-5 w-5" />}
              isLast
            />
          </ol>
        </div>
      </section>

      <SectionBreak />

      {/* Key Features */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="label text-gold-dark mb-4">Capabilities</p>
            <h2>Key Features</h2>
          </div>

          <div className="space-y-24">
            <FeatureSection
              title="Voice-First Recording"
              icon={<Mic className="h-7 w-7 text-gold-dark" />}
              items={[
                "One-tap recording designed for accessibility — no menus, no setup",
                "No time limits, from a 2-minute anecdote to a 45-minute saga",
                "Optional guided prompts that family members can customize",
                "Offline recording — stories sync when connection is restored",
              ]}
            />
            <FeatureSection
              title="AI Story Engine"
              icon={<Sparkles className="h-7 w-7 text-gold-dark" />}
              items={[
                "Transcription optimized for older voices, accents, and colloquial language",
                "Narrative enhancement that preserves the speaker's authentic voice",
                "Automatic theme tagging, character identification, and timeline placement",
                "Cross-story connections that weave individual tales into a larger narrative",
              ]}
            />
            <FeatureSection
              title="Multi-Format Output"
              icon={<BookOpen className="h-7 w-7 text-gold-dark" />}
              items={[
                "Written Stories: memoir-style prose in the storyteller's voice",
                "Podcast Episodes: AI-generated audio in the user's own cloned voice",
                "AI Notebook Prompts: let family converse with the stories",
                "Legacy Books: hardcover printed books compiled from all stories",
              ]}
            />
            <FeatureSection
              title="Legacy Vault & Succession"
              icon={<Shield className="h-7 w-7 text-gold-dark" />}
              items={[
                "Secure cloud storage with end-to-end encryption",
                "Designated Heirs: name family members who inherit full access",
                "Time-Release Capsules: stories that unlock on specific dates",
                "Inactivity Transfer with annual wellness check-ins",
              ]}
            />
            <FeatureSection
              title="Community & Discovery"
              icon={<Globe className="h-7 w-7 text-gold-dark" />}
              items={[
                "Story Circles: topic-based groups — veterans, truckers, immigrants",
                "Era Collections: curated feeds organized by decade",
                "Generational Bridge pairing younger listeners with older storytellers",
                "Privacy controls at every level: private, family, circle, or public",
              ]}
            />
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* Pricing */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="label text-gold-dark mb-4">Pricing</p>
            <h2>Free While We&apos;re in Beta</h2>
            <p className="lead mt-6 text-muted-foreground max-w-xl mx-auto">
              Everything is free right now. Paid tiers below are a preview of
              what&apos;s coming when we leave beta.
            </p>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4 rounded-lg overflow-hidden">
            <PricingCard
              tier="Free"
              price="$0"
              period=""
              highlighted
              betaTag
              features={[
                "Unlimited recordings during beta",
                "Full AI transcription",
                "Written story output",
                "Audio narration",
                "Voice cloning after 5 min recorded",
              ]}
            />
            <PricingCard
              tier="Storyteller"
              price="$9.99"
              period="/mo"
              disabled
              features={[
                "Unlimited recordings",
                "Full AI output suite",
                "50 GB storage",
                "1 designated heir",
                "Story Circles access",
              ]}
            />
            <PricingCard
              tier="Family Legacy"
              price="$19.99"
              period="/mo"
              disabled
              features={[
                "Everything in Storyteller",
                "5 family accounts",
                "Shared family vault",
                "Unlimited heirs",
                "Time-release capsules",
              ]}
            />
            <PricingCard
              tier="Legacy Forever"
              price="$299"
              period=" once"
              disabled
              features={[
                "Lifetime access",
                "500 GB storage",
                "50-year hosting guarantee",
                "Premium book credits",
                "Everything included",
              ]}
            />
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* CTA */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-10 flex justify-center">
            <WaxSeal size={64} monogram="TP" />
          </div>
          <p className="label text-gold-dark mb-6">Begin Your Legacy</p>
          <h2 className="mb-6 leading-tight">
            Every life has a story worth keeping
          </h2>
          <p className="lead text-muted-foreground mb-12 italic font-light">
            Record it. Keep it. Pass it on.
          </p>
          <Link href="/signup">
            <Button size="lg" className="tracking-wide">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionBreak() {
  return (
    <div className="px-6">
      <div className="mx-auto max-w-4xl py-2">
        <div className="section-ornament">
          <span className="section-ornament-dot" />
        </div>
      </div>
    </div>
  );
}

function TimelineStep({
  roman,
  title,
  description,
  icon,
  isLast,
}: {
  roman: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <li className={`relative flex gap-6 ${isLast ? "" : "mb-12"}`}>
      <div className="flex-shrink-0 z-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-background text-gold-dark">
        {icon}
      </div>
      <div className="flex-1 pt-2">
        <p className="label text-gold-dark mb-2">Step {roman}</p>
        <h3 className="mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

function FeatureSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {icon}
        <h3>{title}</h3>
      </div>
      <ul className="list-disc pl-12 space-y-3 marker:text-gold-dark">
        {items.map((item, i) => (
          <li key={i} className="text-muted-foreground pl-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  features,
  highlighted,
  disabled,
  betaTag,
}: {
  tier: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  disabled?: boolean;
  betaTag?: boolean;
}) {
  return (
    <div
      className={`p-8 ${
        disabled
          ? "bg-background/60"
          : highlighted
          ? "bg-primary/5"
          : "bg-background"
      }`}
    >
      <div className={disabled ? "opacity-40" : ""}>
        <div className="flex items-center justify-between mb-3">
          <p className="label text-foreground">{tier}</p>
          {betaTag && (
            <span className="label text-primary border border-primary/40 px-3 py-1 rounded text-base">
              Beta
            </span>
          )}
        </div>
        <p className="mb-6">
          <span className="stat text-foreground">{price}</span>
          <span className="text-muted-foreground ml-1">{period}</span>
        </p>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground">
              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-dark" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      {disabled && (
        <p className="mt-6 pt-6 border-t border-border/50 text-muted-foreground italic">
          Available after beta
        </p>
      )}
    </div>
  );
}
