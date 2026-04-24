"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Mic, Clock, ChevronRight, Sparkles, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface Recording {
  id: string;
  duration_seconds: number;
  status: string;
  transcription: string | null;
  created_at: string;
  stories: Story[];
}

interface Story {
  id: string;
  title: string;
  summary: string;
  themes: string[];
  life_chapter: string;
  status: string;
  created_at: string;
}

export default function StoriesPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceCloneTier, setVoiceCloneTier] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("recordings")
        .select("id, duration_seconds, status, transcription, created_at, stories(id, title, summary, themes, life_chapter, status, created_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setRecordings(data as Recording[]);

      const { data: profile } = await supabase
        .from("profiles")
        .select("voice_clone_tier")
        .eq("id", user.id)
        .single();

      setVoiceCloneTier(profile?.voice_clone_tier || null);
      setLoading(false);
    }

    load();
  }, [supabase]);

  const totalSeconds = recordings.reduce((sum, r) => sum + r.duration_seconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const showBasicPrompt = totalSeconds >= 300 && !voiceCloneTier && !dismissed;
  const showEnhancedPrompt = totalSeconds >= 1800 && voiceCloneTier === "basic" && !dismissed;

  async function handleClone(tier: "basic" | "enhanced") {
    setCloning(true);
    try {
      const res = await fetch("/api/voice/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.voiceId) {
        setVoiceCloneTier(tier);
        toast.success(
          tier === "basic"
            ? "Your personal voice narrator is ready!"
            : "Your enhanced voice narrator is ready!"
        );
      } else {
        toast.error(data.error || "Voice cloning failed");
      }
    } catch {
      toast.error("Voice cloning failed");
    }
    setCloning(false);
  }

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <p className="label text-gold-dark mb-2">Library</p>
      <h1 className="mb-1">Your Stories</h1>
      <p className="text-muted-foreground mb-8">
        {recordings.length} recording{recordings.length !== 1 ? "s" : ""} &middot; {totalMinutes} min total
      </p>

      {/* Voice clone prompt */}
      {(showBasicPrompt || showEnhancedPrompt) && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-5 mb-6">
          <div className="flex items-start gap-4">
            <Volume2 className="h-5 w-5 text-gold-dark mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">
                {showEnhancedPrompt
                  ? "Upgrade your personal narrator"
                  : "Create your personal narrator"}
              </p>
              <p className="text-muted-foreground mb-4">
                {showEnhancedPrompt
                  ? `You now have ${totalMinutes} minutes of recordings. We can create a higher-quality version of your voice narrator.`
                  : `You have ${totalMinutes} minutes of recordings — enough to create a narrator that sounds like you.`}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleClone(showEnhancedPrompt ? "enhanced" : "basic")}
                  disabled={cloning}
                  className="font-heading tracking-wide"
                >
                  {cloning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    showEnhancedPrompt ? "Upgrade Voice" : "Create My Voice"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDismissed(true)}
                  className="font-heading tracking-wide"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full border border-border mb-6">
            <BookOpen className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="mb-2">No Stories Yet</h2>
          <p className="text-muted-foreground max-w-xs">
            Record your first story and it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => {
            const story = rec.stories?.[0];
            if (story && story.status === "ready") {
              return <StoryCard key={rec.id} story={story} recording={rec} />;
            }
            return <RecordingCard key={rec.id} recording={rec} />;
          })}
        </div>
      )}
    </div>
  );
}

function StoryCard({ story, recording }: { story: Story; recording: Recording }) {
  const date = new Date(recording.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const mins = Math.floor(recording.duration_seconds / 60);
  const secs = recording.duration_seconds % 60;
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <Link href={`/stories/${story.id}`}>
      <div className="rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="mb-1">{story.title}</h3>
            <p className="text-muted-foreground mb-3">{story.summary}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {durationStr}
              </span>
              <span className="text-muted-foreground">{formattedDate}</span>
              {story.themes?.slice(0, 3).map((theme) => (
                <span
                  key={theme}
                  className="text-gold-dark bg-gold/10 px-2 py-0.5 rounded"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}

function RecordingCard({ recording }: { recording: Recording }) {
  const date = new Date(recording.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const mins = Math.floor(recording.duration_seconds / 60);
  const secs = recording.duration_seconds % 60;
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const hasStoryGenerating = recording.stories?.some((s) => s.status === "generating");

  const statusLabel: Record<string, string> = {
    uploading: "Uploading",
    uploaded: "Uploaded",
    transcribing: "Transcribing...",
    transcribed: "Transcribed",
    failed: "Failed",
  };

  const preview = recording.transcription
    ? recording.transcription.length > 120
      ? recording.transcription.slice(0, 120) + "..."
      : recording.transcription
    : null;

  return (
    <Link href={`/stories/${recording.id}`}>
      <div className="rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-heading font-semibold text-foreground">
                {formattedDate}
              </span>
              <span className="text-muted-foreground">{formattedTime}</span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {durationStr}
              </span>
              {hasStoryGenerating ? (
                <span className="flex items-center gap-1.5 text-gold-dark">
                  <Sparkles className="h-4 w-4" />
                  Generating story...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mic className="h-4 w-4" />
                  {statusLabel[recording.status] || recording.status}
                </span>
              )}
            </div>

            {preview && (
              <p className="text-muted-foreground italic">
                &ldquo;{preview}&rdquo;
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}
