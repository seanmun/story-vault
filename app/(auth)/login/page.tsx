"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/record");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1>Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to continue your story
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

      <form onSubmit={handleLogin} className="space-y-5">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-12"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 tracking-wide"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
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
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </Button>

      <p className="text-muted-foreground text-center mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
