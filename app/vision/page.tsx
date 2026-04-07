import Link from "next/link";
import {
  Mic,
  BookOpen,
  Podcast,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  Globe,
  Heart,
  MessageCircle,
  Phone,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VisionPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            StoryVault
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-20 md:py-28 text-center">
        <p className="mb-4 text-sm font-medium text-primary tracking-wide uppercase">
          Our Vision
        </p>
        <h1 className="max-w-4xl mx-auto text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Stories Are Dying with the People Who Lived Them
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl leading-relaxed">
          Every day, irreplaceable stories disappear. The veteran who never
          wrote about the war. The grandmother whose recipes kept a family
          alive through the Depression. The pool hustler who ran tables from
          Atlantic City to Las Vegas. Once the storytellers are gone, the
          stories go with them.
        </p>
      </section>

      {/* The Problem */}
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            Existing Solutions Miss the Mark
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            Current platforms still carry significant friction for the people
            who need them most. Older adults have stories to tell but lack the
            technical confidence, writing ability, or patience to navigate
            complex tools.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <ProblemCard
              name="Text-Based Platforms"
              problem="Require users to type written responses — a non-starter for many older adults who aren't comfortable writers."
            />
            <ProblemCard
              name="Basic Voice Apps"
              problem="Improved with voice recording, but still require navigating complex smartphone interfaces."
            />
            <ProblemCard
              name="AI Phone Calls"
              problem="Remove the user's agency and spontaneity. Robotic prompts feel impersonal."
            />
            <ProblemCard
              name="Limited Outputs"
              problem="Most competitors offer transcription and book printing, then stop. No podcasts, no AI notebooks, no shareable clips."
            />
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
            The StoryVault Approach
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            A dead-simple, voice-first storytelling platform. The entire
            experience is built around one action: press a big button and start
            talking. Everything else happens automatically.
          </p>

          <div className="space-y-16">
            <ProcessStep
              step="1"
              title="Record"
              description="Open the app and tap the big, unmissable Record button. Tell your story in your own words, for as long or as short as you want. No prompts required, though optional guided questions are available."
              icon={<Mic className="h-6 w-6" />}
            />
            <ProcessStep
              step="2"
              title="AI Processes"
              description="The recording is transcribed, cleaned up, and analyzed. AI identifies key themes, characters, time periods, and emotional arcs. It organizes the content and flags connections to previous stories."
              icon={<Sparkles className="h-6 w-6" />}
            />
            <ProcessStep
              step="3"
              title="Multi-Format Output"
              description="Your story is transformed into a polished written narrative, a podcast-style audio episode, an AI Notebook prompt for tools like NotebookLM, and a shareable audio clip for family."
              icon={<BookOpen className="h-6 w-6" />}
            />
            <ProcessStep
              step="4"
              title="Organize & Share"
              description="Stories are automatically organized into life chapters — childhood, career, family, adventures. Share with family, and over time your collection grows into a complete memoir."
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Key Features Deep Dive */}
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-16 text-center">
            Key Features
          </h2>

          <div className="space-y-20">
            {/* Voice-First */}
            <FeatureSection
              title="Voice-First Recording"
              icon={<Mic className="h-8 w-8 text-primary" />}
              items={[
                "One-tap recording with a large, prominent button designed for accessibility",
                "No time limits — whether it's a 2-minute anecdote or a 45-minute saga",
                "Optional guided prompts that can be customized by family members",
                "Automatic silence detection and smart segmentation for natural story breaks",
                "Offline recording capability — stories sync when connection is restored",
              ]}
            />

            {/* AI Story Engine */}
            <FeatureSection
              title="AI Story Engine"
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              items={[
                "High-accuracy transcription optimized for older voices, accents, and colloquial language",
                "Narrative enhancement that preserves the speaker's authentic voice and style",
                "Automatic theme tagging, character identification, and timeline placement",
                "Cross-story connections — \"This reminds me of the story you told about Atlantic City\"",
                "Fact-checking prompts for dates, names, and places to help verify details",
              ]}
            />

            {/* Multi-Format Output */}
            <FeatureSection
              title="Multi-Format Output"
              icon={<BookOpen className="h-8 w-8 text-primary" />}
              items={[
                "Written Stories: polished prose that reads like memoir chapters, in the storyteller's voice",
                "Podcast Episodes: AI-generated audio with intro/outro and ambient sound",
                "AI Notebook Prompts: let family members have conversations with the stories",
                "Shareable Clips: 60-second highlights with the storyteller's actual voice",
                "Legacy Books: hardcover printed books compiled from all stories",
              ]}
            />

            {/* Legacy Vault */}
            <FeatureSection
              title="Legacy Vault & Succession Planning"
              icon={<Shield className="h-8 w-8 text-primary" />}
              items={[
                "Secure cloud storage with end-to-end encryption",
                "Designated Heir system: name family members who inherit full access to your StoryVault",
                "Time-Release Capsules: stories that unlock on specific dates — a grandchild's 18th birthday, a wedding day",
                "Inactivity Transfer: automatic access transfer after a configurable period",
                "Annual wellness check-in with escalating notifications to heirs",
              ]}
            />

            {/* Community */}
            <FeatureSection
              title="Community & Discovery"
              icon={<Globe className="h-8 w-8 text-primary" />}
              items={[
                "Story Circles: topic-based groups — veterans, truckers, pool players, nurses, immigrants",
                "Era Collections: curated feeds organized by decade — \"Stories from the 1970s\"",
                "Generational Bridge: pairing younger listeners with older storytellers",
                "Family Tree Integration: connect stories to family members across lineages",
                "Privacy controls at every level: private, family, circle, or public",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-16 text-center">
            Who It&apos;s For
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <AudienceCard
              icon={<Volume2 className="h-6 w-6 text-primary" />}
              title="The Storyteller"
              age="Ages 55+"
              description="Adults who have lived rich, eventful lives but are unlikely to write a memoir. Comfortable talking, motivated by the idea that their grandchildren will one day hear their stories."
            />
            <AudienceCard
              icon={<Heart className="h-6 w-6 text-primary" />}
              title="The Family Champion"
              age="Ages 30-55"
              description={"The adult child or grandchild who buys StoryVault as a gift. The one who has said \"I wish I had recorded Grandpa's stories before he passed.\""}
            />
            <AudienceCard
              icon={<MessageCircle className="h-6 w-6 text-primary" />}
              title="History Enthusiasts"
              age="All Ages"
              description="People passionate about oral history. Veterans groups, cultural organizations, retirement communities preserving collective memory."
            />
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            Design Philosophy: Radical Simplicity
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Every screen, every interaction, every notification must pass the
            Bumper Test.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <DesignPrinciple
              title="The Big Button"
              description="The home screen is dominated by a single, large Record button. Nothing else competes for attention. Physically large enough for arthritic fingers and visually obvious for low-vision users."
            />
            <DesignPrinciple
              title="Zero Navigation Required"
              description="The app opens to the Record screen. Previous stories are one swipe away. No onboarding tutorial because none should be needed."
            />
            <DesignPrinciple
              title="Accessible by Default"
              description="Large text, high contrast, hearing-aid compatible audio, screen reader optimized, and a simplified Easy Mode that removes all non-essential elements."
            />
            <DesignPrinciple
              title="Warm and Personal"
              description="The app feels like a living room, not a tech product. Warm colors, gentle animations, and language that treats the user as a storyteller, not a customer."
            />
          </div>
        </div>
      </section>

      {/* The Origin Story */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            The Origin Story
          </h2>
          <div className="prose prose-lg mx-auto text-muted-foreground leading-relaxed space-y-6">
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
            <p className="text-foreground font-medium">
              That is the insight behind StoryVault. The world is full of
              Bumpers. People with extraordinary lives and extraordinary
              stories who will never become authors. The technology now exists
              to meet them exactly where they are: in conversation. All we
              have to do is build the bridge between talking and legacy.
            </p>
            <p>
              Two hundred years from now, Bumper&apos;s
              great-great-great-grandchildren should be able to hear his
              voice, read his stories, and know exactly what kind of man he
              was. That is what StoryVault is for.
            </p>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            The Opportunity
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 mb-12">
            <StatCard value="$22.5B+" label="Digital legacy market (2024)" />
            <StatCard value="73M" label="Baby Boomers in the US alone" />
            <StatCard value="13-15%" label="Annual market growth rate" />
          </div>
          <div className="space-y-4 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <p>
              The Baby Boomer generation represents the wealthiest and most
              tech-adjacent older generation in history. They are increasingly
              comfortable with smartphones and voice assistants, making a
              voice-first app a natural fit. By 2030, all Boomers will be
              over 65, creating peak demand for legacy preservation tools.
            </p>
            <p>
              There is a growing cultural awareness of the importance of
              preserving oral history, amplified by projects like StoryCorps,
              memoir-focused shows, and the viral popularity of grandparent
              storytelling content on social media. The convergence of this
              cultural moment with AI capabilities creates a unique window of
              opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
            Simple Pricing
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Start free, upgrade when you&apos;re ready.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                "200 GB storage",
              ]}
            />
            <PricingCard
              tier="Legacy Forever"
              price="$299"
              period=" one-time"
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
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Every life has a story worth keeping
          </h2>
          <p className="text-lg text-muted-foreground mb-2 italic">
            Record it. Keep it. Pass it on.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="text-base px-10">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-8">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            StoryVault &mdash; Record it. Keep it. Pass it on.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({
  name,
  problem,
}: {
  name: string;
  problem: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background p-6">
      <h3 className="font-semibold text-foreground mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {problem}
      </p>
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
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          Step {step}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
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
    <div>
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-muted-foreground leading-relaxed">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary/60" />
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
    <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-primary font-medium mb-3">{age}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
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
    <div className="rounded-xl border border-border/50 bg-background p-6">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
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
    <div
      className={`rounded-xl border p-6 ${
        highlighted
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border/50 bg-card"
      }`}
    >
      <h3 className="font-semibold text-foreground mb-1">{tier}</h3>
      <p className="mb-4">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
