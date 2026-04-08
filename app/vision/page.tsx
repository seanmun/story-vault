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
  Heart,
  MessageCircle,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VisionPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-24 md:py-36 text-center">
        <p className="mb-6 text-base font-heading tracking-[0.3em] text-gold-dark uppercase">
          Our Vision
        </p>
        <h1 className="max-w-4xl mx-auto text-4xl font-heading font-semibold tracking-wide text-foreground md:text-6xl lg:text-7xl leading-[1.1]">
          Stories Are Dying
          <br />
          <span className="text-primary italic font-body font-light">with the people</span>
          <br />
          Who Lived Them
        </h1>
        <p className="mt-8 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Every day, irreplaceable stories disappear. The veteran who never
          wrote about the war. The grandmother whose recipes kept a family
          alive. The pool hustler who ran tables from coast to coast. Once the
          storytellers are gone, the stories go with them.
        </p>

        {/* ElevenLabs AudioNative Player */}
        <div className="mt-10 w-full max-w-2xl mx-auto">
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

        <Divider />
      </section>

      {/* The Problem */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            The Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 text-center">
            Existing Solutions Miss the Mark
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            Current platforms carry significant friction for the people
            who need them most. Older adults have stories to tell but lack the
            technical confidence or patience for complex tools.
          </p>
          <div className="grid gap-px bg-border md:grid-cols-2 rounded-lg overflow-hidden">
            <ProblemCard
              name="Text-Based Platforms"
              problem="Require written responses — a non-starter for many older adults who aren't comfortable writers."
            />
            <ProblemCard
              name="Basic Voice Apps"
              problem="Improved with voice recording, but still require navigating complex smartphone interfaces."
            />
            <ProblemCard
              name="AI Phone Calls"
              problem="Remove the user's agency and spontaneity. Robotic prompts feel impersonal and scripted."
            />
            <ProblemCard
              name="Limited Outputs"
              problem="Competitors offer transcription and book printing, then stop. No podcasts, no AI notebooks, no shareable clips."
            />
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            The Solution
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 text-center">
            The StoryVault Approach
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-20 leading-relaxed">
            A voice-first platform built around one action: press a button and
            start talking. Everything else happens automatically.
          </p>

          <div className="space-y-20">
            <ProcessStep
              step="I"
              title="Record"
              description="Open the app and tap the big, unmissable Record button. Tell your story in your own words, for as long or as short as you want. No prompts required, though guided questions are available."
              icon={<Mic className="h-6 w-6" />}
            />
            <ProcessStep
              step="II"
              title="AI Processes"
              description="The recording is transcribed, enhanced, and analyzed. AI identifies themes, characters, time periods, and emotional arcs. It organizes the content and finds connections to your other stories."
              icon={<Sparkles className="h-6 w-6" />}
            />
            <ProcessStep
              step="III"
              title="Multi-Format Output"
              description="Your story becomes a polished written narrative, a podcast-style audio episode, an AI Notebook prompt for interactive conversations, and a shareable audio clip for family."
              icon={<BookOpen className="h-6 w-6" />}
            />
            <ProcessStep
              step="IV"
              title="Organize & Share"
              description="Stories are automatically organized into life chapters — childhood, career, family, adventures. Share with family, and over time your collection becomes a complete memoir."
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-20 text-center">
            Key Features
          </h2>

          <div className="space-y-24">
            <FeatureSection
              title="Voice-First Recording"
              icon={<Mic className="h-7 w-7 text-gold-dark" />}
              items={[
                "One-tap recording with a large, prominent button designed for accessibility",
                "No time limits — whether it's a 2-minute anecdote or a 45-minute saga",
                "Optional guided prompts that can be customized by family members",
                "Automatic silence detection and smart segmentation for natural story breaks",
                "Offline recording capability — stories sync when connection is restored",
              ]}
            />
            <FeatureSection
              title="AI Story Engine"
              icon={<Sparkles className="h-7 w-7 text-gold-dark" />}
              items={[
                "High-accuracy transcription optimized for older voices, accents, and colloquial language",
                "Narrative enhancement that preserves the speaker's authentic voice and style",
                "Automatic theme tagging, character identification, and timeline placement",
                "Cross-story connections that weave individual tales into a larger narrative",
                "Fact-checking prompts for dates, names, and places to verify details",
              ]}
            />
            <FeatureSection
              title="Multi-Format Output"
              icon={<BookOpen className="h-7 w-7 text-gold-dark" />}
              items={[
                "Written Stories: polished prose that reads like memoir chapters, in the storyteller's voice",
                "Podcast Episodes: AI-generated audio with intro, outro, and ambient sound",
                "AI Notebook Prompts: let family members have conversations with the stories",
                "Shareable Clips: 60-second highlights with the storyteller's actual voice",
                "Legacy Books: hardcover printed books compiled from all stories",
              ]}
            />
            <FeatureSection
              title="Legacy Vault & Succession"
              icon={<Shield className="h-7 w-7 text-gold-dark" />}
              items={[
                "Secure cloud storage with end-to-end encryption",
                "Designated Heir system: name family members who inherit full access",
                "Time-Release Capsules: stories that unlock on specific dates — birthdays, weddings, anniversaries",
                "Inactivity Transfer: automatic access transfer after a configurable period",
                "Annual wellness check-in with escalating notifications to heirs",
              ]}
            />
            <FeatureSection
              title="Community & Discovery"
              icon={<Globe className="h-7 w-7 text-gold-dark" />}
              items={[
                "Story Circles: topic-based groups — veterans, truckers, pool players, nurses, immigrants",
                "Era Collections: curated feeds organized by decade",
                "Generational Bridge: pairing younger listeners with older storytellers",
                "Family Tree Integration: connect stories to family members across lineages",
                "Privacy controls at every level: private, family, circle, or public",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            Audience
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-20 text-center">
            Who It&apos;s For
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <AudienceCard
              icon={<Volume2 className="h-5 w-5 text-gold-dark" />}
              title="The Storyteller"
              age="Ages 55+"
              description="Adults who have lived extraordinary lives but are unlikely to write a memoir. Comfortable talking, motivated by the idea that their grandchildren will one day hear their stories."
            />
            <AudienceCard
              icon={<Heart className="h-5 w-5 text-gold-dark" />}
              title="The Family Champion"
              age="Ages 30-55"
              description={"The adult child or grandchild who buys StoryVault as a gift. The one who has said \"I wish I had recorded Grandpa's stories before he passed.\""}
            />
            <AudienceCard
              icon={<MessageCircle className="h-5 w-5 text-gold-dark" />}
              title="History Enthusiasts"
              age="All Ages"
              description="People passionate about oral history. Veterans groups, cultural organizations, and retirement communities preserving collective memory."
            />
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            Philosophy
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 text-center">
            Radical Simplicity
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            Every screen, every interaction, every notification must pass the
            Bumper Test.
          </p>
          <div className="grid gap-px bg-border sm:grid-cols-2 rounded-lg overflow-hidden">
            <DesignPrinciple
              title="The Big Button"
              description="The home screen is dominated by a single, large Record button. Nothing else competes for attention. Large enough for arthritic fingers, obvious enough for low-vision users."
            />
            <DesignPrinciple
              title="Zero Navigation"
              description="The app opens to Record. Previous stories are one swipe away. Settings hide behind a simple icon. No onboarding tutorial — because none should be needed."
            />
            <DesignPrinciple
              title="Accessible by Default"
              description="Large text, high contrast, hearing-aid compatible audio, screen reader optimized, and a simplified Easy Mode for non-essential elements."
            />
            <DesignPrinciple
              title="Warm & Personal"
              description="The app feels like a living room, not a tech product. Warm colors, gentle animations, and language that treats you as a storyteller."
            />
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            Origin
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-12 text-center">
            Why This Exists
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
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

            <Divider />

            <p className="text-foreground font-medium text-xl leading-relaxed">
              That is the insight behind StoryVault. The world is full of
              Bumpers. People with extraordinary lives and extraordinary
              stories who will never become authors. The technology now exists
              to meet them exactly where they are: in conversation.
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

      {/* Market */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            Opportunity
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-16 text-center">
            The Market
          </h2>
          <div className="grid gap-12 sm:grid-cols-3 mb-16">
            <StatCard value="$22.5B+" label="Digital legacy market (2024)" />
            <StatCard value="73M" label="Baby Boomers in the US" />
            <StatCard value="13-15%" label="Annual market growth" />
          </div>
          <div className="space-y-5 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <p>
              The Baby Boomer generation represents the wealthiest and most
              tech-adjacent older generation in history. By 2030, all Boomers
              will be over 65, creating peak demand for legacy preservation.
            </p>
            <p>
              The convergence of cultural awareness around oral history with
              AI capabilities that make voice-to-content transformation
              seamless creates a unique window of opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 text-center">
            Simple & Transparent
          </h2>
          <p className="text-center text-muted-foreground mb-16">
            Start free. Upgrade when you&apos;re ready.
          </p>
          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4 rounded-lg overflow-hidden">
            <PricingCard
              tier="Free"
              price="$0"
              period=""
              features={[
                "5 recordings/month",
                "Basic transcription",
                "Written story output",
                "1 GB storage",
              ]}
            />
            <PricingCard
              tier="Storyteller"
              price="$9.99"
              period="/mo"
              highlighted
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

      {/* CTA */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-6">
            Begin Your Legacy
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-tight">
            Every life has a story worth keeping
          </h2>
          <p className="text-lg text-muted-foreground mb-2 italic font-light">
            Record it. Keep it. Pass it on.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg" className="text-base px-12 tracking-wide">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 text-gold/40 py-4">
      <div className="h-px w-12 bg-current" />
      <div className="h-1.5 w-1.5 rounded-full bg-current" />
      <div className="h-px w-12 bg-current" />
    </div>
  );
}

function ProblemCard({ name, problem }: { name: string; problem: string }) {
  return (
    <div className="bg-background p-8">
      <h3 className="font-heading text-base tracking-wider font-semibold text-foreground mb-3 uppercase">
        {name}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{problem}</p>
    </div>
  );
}

function ProcessStep({
  step,
  title,
  description,
  icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-8 items-start">
      <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-gold-dark">
        {icon}
      </div>
      <div>
        <div className="font-heading text-base tracking-[0.3em] text-gold-dark uppercase mb-2">
          Step {step}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
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
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="list-disc pl-12 space-y-3 marker:text-gold-dark">
        {items.map((item, i) => (
          <li key={i} className="text-base text-muted-foreground leading-relaxed pl-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AudienceCard({
  icon,
  title,
  age,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  age: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-8 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-heading text-base tracking-wide font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-base font-heading tracking-widest text-gold-dark uppercase mt-1 mb-4">
        {age}
      </p>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-heading font-semibold text-primary">{value}</p>
      <p className="text-base text-muted-foreground mt-2">{label}</p>
    </div>
  );
}

function DesignPrinciple({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-8">
      <h3 className="font-heading text-base tracking-wider font-semibold text-foreground mb-3 uppercase">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  features,
  highlighted,
}: {
  tier: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div className={`p-8 ${highlighted ? "bg-primary/5" : "bg-background"}`}>
      <h3 className="font-heading text-base tracking-wider font-semibold text-foreground uppercase">
        {tier}
      </h3>
      <p className="mt-3 mb-6">
        <span className="text-3xl font-heading font-semibold text-foreground">{price}</span>
        <span className="text-base text-muted-foreground">{period}</span>
      </p>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-base text-muted-foreground">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-dark" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
