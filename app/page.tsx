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

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-28 md:py-40 text-center overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

        <p className="label text-gold-dark mb-6">
          Ad Posteros &middot; Since 1350
        </p>
        <Logo as="h1" size="xl" className="max-w-4xl" />
        <p className="lead mt-8 max-w-xl font-body italic text-foreground/80">
          In your own voice.
        </p>
        <p className="mt-6 max-w-lg text-muted-foreground">
          Record a story for your grandkids. We turn it into a letter
          your family will read, hear, and share for generations.
        </p>
        <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:gap-5 sm:items-center">
          <Link href="/signup">
            <Button size="lg" className="tracking-wide">
              Write Your First Letter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/vision">
            <Button variant="outline" size="lg" className="tracking-wide">
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
          <p className="label text-center text-gold-dark mb-4">
            The Process
          </p>
          <h2 className="text-center mb-6">Three Steps to Forever</h2>
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
          <p className="label text-center text-gold-dark mb-4">
            One Recording, Many Legacies
          </p>
          <h2 className="text-center mb-6">
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
          <blockquote className="quote text-foreground/80 mb-8">
            &ldquo;He would sit in his living room and talk for an hour about
            the time he hustled a guy out of $5,000 in a bar in New Jersey.
            All you have to do is ask him and hand him a microphone.&rdquo;
          </blockquote>
          <p className="label text-gold-dark mb-8">
            The Bumper Test
          </p>
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

      {/* CTA */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label text-gold-dark mb-6">
            Begin Today
          </p>
          <h2 className="mb-6 leading-tight">
            Two hundred years from now, your story should still be heard
          </h2>
          <p className="lead text-muted-foreground mb-10 italic font-light">
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
      <div className="label text-gold-dark mb-3">Step {number}</div>
      <h3 className="mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
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
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
