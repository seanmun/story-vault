import Link from "next/link";
import {
  Mic,
  BookOpen,
  Podcast,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { WaxSeal } from "@/components/WaxSeal";

export default function HomePage() {
  return (
    <div className="paper-texture">
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-28 md:pt-28 md:pb-40 text-center">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          {/* Wax seal anchor */}
          <div className="mb-12 md:mb-16">
            <WaxSeal size={96} monogram="TP" />
          </div>

          <p className="label text-gold-dark mb-6">
            Ad Posteros &middot; Since 1350
          </p>
          <Logo as="h1" size="xl" className="display max-w-4xl" />
          <p className="lead mt-10 max-w-xl font-body italic text-foreground/80">
            In your own voice.
          </p>
          <p className="mt-6 max-w-md text-muted-foreground">
            Record a story for your grandkids. We turn it into a letter
            your family will read, hear, and share for generations.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/signup">
              <Button size="lg" className="tracking-wide">
                Tell Your First Letter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/vision">
              <Button variant="outline" size="lg" className="tracking-wide">
                Our Vision
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* How It Works */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="label text-gold-dark mb-4">The Process</p>
            <h2>Three Steps to Forever</h2>
            <p className="lead mt-6 text-muted-foreground max-w-xl mx-auto">
              If you can have a conversation, you can preserve your legacy.
            </p>
          </div>
          <div className="grid gap-16 md:grid-cols-3 md:gap-12">
            <NumberedStep
              roman="I"
              icon={<Mic className="h-6 w-6" />}
              title="Record"
              description="Tap the button and start talking. Tell your story in your own words, at your own pace."
            />
            <NumberedStep
              roman="II"
              icon={<Sparkles className="h-6 w-6" />}
              title="Transform"
              description="AI transcribes, polishes, and preserves your authentic voice across written, audio, and conversational formats."
            />
            <NumberedStep
              roman="III"
              icon={<BookOpen className="h-6 w-6" />}
              title="Preserve"
              description="Read, listen, and share your stories with family. Build a collection that endures for generations."
            />
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* Features */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="label text-gold-dark mb-4">One Recording, Many Letters</p>
            <h2>Every Format Your Family Will Treasure</h2>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-hidden">
            <FeatureTile
              icon={<BookOpen className="h-5 w-5" />}
              title="Written Stories"
              description="Polished prose that reads like a memoir chapter, in your voice and your words."
            />
            <FeatureTile
              icon={<Podcast className="h-5 w-5" />}
              title="Podcast Episodes"
              description="AI-narrated audio episodes your family can listen to anytime, anywhere."
            />
            <FeatureTile
              icon={<Sparkles className="h-5 w-5" />}
              title="AI Notebooks"
              description="Interactive conversations with your stories — as if talking to your memories."
            />
            <FeatureTile
              icon={<Users className="h-5 w-5" />}
              title="Family Sharing"
              description="Share with your family group. Everyone stays connected to the memories that matter."
            />
            <FeatureTile
              icon={<Shield className="h-5 w-5" />}
              title="Legacy Vault"
              description="Designate heirs who inherit your stories. Your voice lives on for generations."
            />
            <FeatureTile
              icon={<Mic className="h-5 w-5" />}
              title="Shareable Clips"
              description="60-second highlights with your actual voice, perfect for sharing with loved ones."
            />
          </div>
        </div>
      </section>

      <SectionBreak />

      {/* The Bumper Test — Editorial pull quote */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="label text-gold-dark mb-12">The Bumper Test</p>
          <blockquote className="pull-quote text-foreground/85 mb-12 pl-8 md:pl-12 text-left">
            He would sit in his living room and talk for an hour about
            the time he hustled a guy out of $5,000 in a bar in New Jersey.
            All you have to do is ask him and hand him a microphone.
          </blockquote>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">
            Every feature must pass this test: if a soon-to-be-70 retired
            billiards hustler can&apos;t figure it out in 10 seconds, it gets
            redesigned.
          </p>
          <Link href="/vision">
            <Button variant="outline" className="tracking-wide">
              Read the Full Story
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <SectionBreak />

      {/* CTA */}
      <section className="marketing-section px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-10 flex justify-center">
            <WaxSeal size={64} monogram="TP" />
          </div>
          <p className="label text-gold-dark mb-6">Begin Today</p>
          <h2 className="mb-6">
            Two hundred years from now, your story should still be heard
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

function NumberedStep({
  roman,
  icon,
  title,
  description,
}: {
  roman: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex items-baseline gap-3 text-gold-dark">
        <span
          className="font-heading font-bold leading-none"
          style={{ fontSize: "4rem" }}
        >
          {roman}
        </span>
        <span className="opacity-60">{icon}</span>
      </div>
      <h3 className="mb-4">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-8 transition-colors hover:bg-card">
      <div className="text-gold-dark mb-5">{icon}</div>
      <h3 className="mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
