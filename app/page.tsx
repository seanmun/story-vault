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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-heading text-2xl tracking-widest text-primary uppercase">
            StoryVault
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/vision"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              Vision
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="tracking-wide">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="tracking-wide">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-28 md:py-40 text-center overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

        <p className="mb-6 text-sm font-heading tracking-[0.3em] text-gold-dark uppercase">
          Every Life Has a Story Worth Keeping
        </p>
        <h1 className="max-w-4xl text-5xl font-heading font-semibold tracking-wide text-foreground md:text-7xl lg:text-8xl leading-[1.1]">
          Your Voice
          <br />
          <span className="text-primary italic font-body font-light">becomes your</span>
          <br />
          Legacy
        </h1>
        <p className="mt-8 max-w-lg text-lg text-muted-foreground leading-relaxed">
          Simply talk. StoryVault transforms your spoken memories into polished
          stories, podcasts, and keepsakes your family will treasure for
          generations.
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="text-base px-10 tracking-wide">
              Begin Your Legacy
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/vision">
            <Button variant="outline" size="lg" className="text-base px-10 tracking-wide">
              Our Vision
            </Button>
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="mt-24 flex items-center gap-4 text-gold/40">
          <div className="h-px w-16 bg-current" />
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          <div className="h-px w-16 bg-current" />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            The Process
          </p>
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Three Steps to Forever
          </h2>
          <p className="text-center text-muted-foreground mb-20 max-w-xl mx-auto">
            If you can have a conversation, you can preserve your legacy.
            No writing. No typing. No tech skills required.
          </p>
          <div className="grid gap-16 md:grid-cols-3">
            <Step
              number="I"
              icon={<Mic className="h-7 w-7" />}
              title="Record"
              description="Tap the button and start talking. Tell your story in your own words, at your own pace. That's all you need to do."
            />
            <Step
              number="II"
              icon={<Sparkles className="h-7 w-7" />}
              title="Transform"
              description="AI transcribes your words, enhances the narrative, and creates multiple formats — preserving your authentic voice throughout."
            />
            <Step
              number="III"
              icon={<BookOpen className="h-7 w-7" />}
              title="Preserve"
              description="Read, listen, and share your stories with family. Build a collection that endures for generations to come."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-heading tracking-[0.25em] text-gold-dark uppercase mb-4">
            One Recording, Many Legacies
          </p>
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Every Format Your Family Will Treasure
          </h2>
          <p className="text-center text-muted-foreground mb-20 max-w-xl mx-auto">
            Each story you tell is automatically transformed into formats that
            bring your words to life in different ways.
          </p>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-5 w-5 text-gold-dark" />}
              title="Written Stories"
              description="Polished prose that reads like a memoir chapter, in your voice and your words."
            />
            <FeatureCard
              icon={<Podcast className="h-5 w-5 text-gold-dark" />}
              title="Podcast Episodes"
              description="AI-narrated audio episodes your family can listen to anytime, anywhere."
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5 text-gold-dark" />}
              title="AI Notebooks"
              description="Interactive conversations with your stories through AI — as if talking to your memories."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5 text-gold-dark" />}
              title="Family Sharing"
              description="Share stories with your family group. Everyone stays connected to the memories that matter."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5 text-gold-dark" />}
              title="Legacy Vault"
              description="Designate heirs who inherit your stories. Your voice lives on for generations."
            />
            <FeatureCard
              icon={<Mic className="h-5 w-5 text-gold-dark" />}
              title="Shareable Clips"
              description="60-second audio highlights with your actual voice, perfect for sharing with loved ones."
            />
          </div>
        </div>
      </section>

      {/* The Bumper Test — Editorial Quote */}
      <section className="bg-card px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4 text-gold/40 mb-12">
            <div className="h-px w-12 bg-current" />
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
            <div className="h-px w-12 bg-current" />
          </div>
          <blockquote className="text-2xl md:text-3xl font-body font-light italic leading-relaxed text-foreground/80 mb-8">
            &ldquo;He would sit in his living room and talk for an hour about
            the time he hustled a guy out of $5,000 in a bar in New Jersey.
            All you have to do is ask him and hand him a microphone.&rdquo;
          </blockquote>
          <p className="text-sm font-heading tracking-[0.2em] text-gold-dark uppercase mb-8">
            The Bumper Test
          </p>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">
            Every feature must pass this test: if a 65-year-old retired
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

      {/* CTA */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-heading tracking-[0.25em] text-gold-dark uppercase mb-6">
            Begin Today
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 leading-tight">
            Two hundred years from now, your story should still be heard
          </h2>
          <p className="text-lg text-muted-foreground mb-10 italic font-light">
            Record it. Keep it. Pass it on.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-12 tracking-wide">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <p className="font-heading text-sm tracking-[0.2em] text-foreground/60 uppercase">
                StoryVault
              </p>
              <p className="text-sm text-muted-foreground mt-1 italic">
                Every life has a story worth keeping.
              </p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/vision" className="hover:text-foreground transition-colors tracking-wide">
                Vision
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors tracking-wide">
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-foreground transition-colors tracking-wide">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 text-gold-dark">
        {icon}
      </div>
      <div className="mb-3 font-heading text-xs tracking-[0.3em] text-gold-dark uppercase">
        Step {number}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-8 transition-colors hover:bg-card rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-base font-heading tracking-wide font-semibold text-foreground">{title}</h3>
      <p className="text-[0.95rem] text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
