"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { WaxSeal } from "@/components/WaxSeal";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) setError(error.message);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <WaxSeal size={56} monogram="TP" />
        </div>
        <p className="label text-gold-dark mb-3">Sealed &amp; Sent</p>
        <h1 className="mb-4">Check Your Email</h1>
        <p className="lead italic text-muted-foreground mb-8">
          We sent a confirmation link to{" "}
          <strong className="text-foreground not-italic">{email}</strong>.
          Click it to begin your legacy.
        </p>
        <Link href="/login">
          <Button variant="outline" className="tracking-wide">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <div className="mb-6 flex justify-center">
          <WaxSeal size={56} monogram="TP" />
        </div>
        <p className="label text-gold-dark mb-3">Begin Today</p>
        <h1 className="mb-2">Create Your Account</h1>
        <p className="text-muted-foreground italic">
          Start preserving your stories
        </p>
      </div>

      {error && (
        <p
          className="text-destructive bg-destructive/10 rounded-md p-3 mb-6"
          role="alert"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="tracking-wide">
            Display Name
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="What should we call you?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="tracking-wide">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="tracking-wide">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="h-12"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 tracking-wide"
          disabled={loading}
        >
          {loading ? "Creating your vault..." : "Create Account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground tracking-widest uppercase">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <Button
        variant="outline"
        className="w-full h-12 tracking-wide"
        onClick={handleGoogleSignup}
      >
        Continue with Google
      </Button>

      <p className="text-muted-foreground text-center mt-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
