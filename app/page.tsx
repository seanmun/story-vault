import Link from "next/link";
import {
  Mic,
  BookOpen,
  Podcast,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
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
              href="/vision"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Vision
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
      <section className="flex flex-col items-center justify-center px-4 py-24 md:py-32 text-center">
        <p className="mb-4 text-sm font-medium text-primary tracking-wide uppercase">
          Every Life Has a Story Worth Keeping
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Your voice becomes
          <br />
          <span className="text-primary">your legacy</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
          Just talk. StoryVault transforms your spoken memories into polished
          stories, podcasts, and shareable keepsakes — automatically.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Start Recording Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/vision">
            <Button variant="outline" size="lg" className="text-base px-8">
              Our Vision
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            If you can talk, you can leave a legacy. No writing, no typing, no
            tech skills required.
          </p>
          <div className="grid gap-12 md:grid-cols-3">
            <Step
              number="1"
              icon={<Mic className="h-8 w-8" />}
              title="Record"
              description="Tap the big button and start talking. Tell your story in your own words, for as long as you want."
            />
            <Step
              number="2"
              icon={<Sparkles className="h-8 w-8" />}
              title="AI Transforms"
              description="Our AI transcribes your words, enhances the narrative, and creates multiple formats — all while preserving your authentic voice."
            />
            <Step
              number="3"
              icon={<BookOpen className="h-8 w-8" />}
              title="Share & Preserve"
              description="Read, listen, and share your stories with family. Build a collection that lasts for generations."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-foreground mb-4">
            One Recording, Many Formats
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Every story you tell is automatically transformed into formats your
            family will treasure.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6 text-primary" />}
              title="Written Stories"
              description="Polished prose that reads like a memoir chapter, in your voice and your words."
            />
            <FeatureCard
              icon={<Podcast className="h-6 w-6 text-primary" />}
              title="Podcast Episodes"
              description="AI-narrated audio episodes your family can listen to anytime, anywhere."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-primary" />}
              title="AI Notebooks"
              description="Let your family ask questions and explore your stories through interactive AI conversations."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Family Sharing"
              description="Share stories with your family group. Everyone stays connected to the memories that matter."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Legacy Vault"
              description="Designate heirs who inherit your stories. Your voice lives on for generations."
            />
            <FeatureCard
              icon={<Mic className="h-6 w-6 text-primary" />}
              title="Shareable Clips"
              description="60-second audio highlights with your actual voice, perfect for sharing with loved ones."
            />
          </div>
        </div>
      </section>

      {/* The Bumper Test */}
      <section className="border-t border-border/50 bg-card px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            The Bumper Test
          </h2>
          <blockquote className="text-lg text-muted-foreground italic leading-relaxed mb-6">
            &ldquo;Bumper was a billiards hustler. Not the kind you see in movies.
            He was loud, colorful, and impossible to ignore. He played against
            legends of the game. But Bumper is never going to write a book. He
            would, however, sit in his living room and talk for an hour about
            the time he hustled a guy out of $5,000 in a bar in New Jersey.&rdquo;
          </blockquote>
          <p className="text-muted-foreground mb-8">
            Every feature in StoryVault must pass the Bumper Test: if a
            65-year-old retired billiards hustler can&apos;t figure it out in 10
            seconds, it gets redesigned.
          </p>
          <Link href="/vision">
            <Button variant="outline">
              Read the Full Story
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start preserving your stories today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Two hundred years from now, your great-great-great-grandchildren
            should be able to hear your voice and know exactly who you were.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-8">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            StoryVault &mdash; Record it. Keep it. Pass it on.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/vision" className="hover:text-foreground transition-colors">
              Vision
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mb-2 text-xs font-semibold text-primary uppercase tracking-wider">
        Step {number}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
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
    <div className="rounded-xl border border-border/50 bg-card p-6 transition-shadow hover:shadow-md">
      <div className="mb-3">{icon}</div>
      <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
