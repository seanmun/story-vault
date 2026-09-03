"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LogOut, User, Users, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name ?? "");
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  async function handleSave() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto space-y-10">
      <div>
        <p className="label text-gold-dark mb-3">Account</p>
        <h1 className="mb-2">Settings</h1>
        <p className="text-muted-foreground italic">
          Manage your account details
        </p>
      </div>

      <div className="rounded-lg border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
          <p className="label text-foreground">Profile</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName" className="tracking-wide">
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="tracking-wide">
            Email
          </Label>
          <Input id="email" value={email} disabled className="h-12" />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="tracking-wide"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Link
        href="/characters"
        className="flex items-center justify-between rounded-lg border border-border p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
          <div>
            <p className="label text-foreground">Characters</p>
            <p className="text-muted-foreground">
              The people in your stories — add photos so films draw them true
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </Link>

      <Separator />

      <Button
        variant="outline"
        className="w-full h-12 text-destructive tracking-wide"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
