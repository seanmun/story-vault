"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Mic,
  Clock,
  ChevronRight,
  Sparkles,
  Volume2,
  Loader2,
  MoreVertical,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaxSeal } from "@/components/WaxSeal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";

interface Recording {
  id: string;
  duration_seconds: number;
  status: string;
  transcription: string | null;
  created_at: string;
  // One story per recording (unique index) — PostgREST embeds it as an
  // object, not an array.
  stories: Story | null;
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

interface Collection {
  id: string;
  name: string;
}

export default function StoriesPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberships, setMemberships] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [voiceCloneTier, setVoiceCloneTier] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [collectionRecording, setCollectionRecording] = useState<Recording | null>(null);
  const [deleteRecording, setDeleteRecording] = useState<Recording | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Expired session on a client-side transition — bounce instead of
      // pinning the page to "Loading..." forever.
      window.location.assign("/login");
      return;
    }

    const [{ data: recs }, { data: cols }, { data: cms }, { data: profile }] =
      await Promise.all([
        supabase
          .from("recordings")
          .select(
            "id, duration_seconds, status, transcription, created_at, stories(id, title, summary, themes, life_chapter, status, created_at)"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("collections")
          .select("id, name")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: true }),
        supabase
          .from("collection_recordings")
          .select("collection_id, recording_id, collections!inner(user_id)")
          .eq("collections.user_id", user.id),
        supabase
          .from("profiles")
          .select("voice_clone_tier")
          .eq("id", user.id)
          .single(),
      ]);

    if (recs) setRecordings(recs as Recording[]);
    if (cols) setCollections(cols as Collection[]);
    if (cms) {
      const map: Record<string, Set<string>> = {};
      for (const m of cms as { collection_id: string; recording_id: string }[]) {
        if (!map[m.recording_id]) map[m.recording_id] = new Set();
        map[m.recording_id].add(m.collection_id);
      }
      setMemberships(map);
    }
    setVoiceCloneTier((profile as { voice_clone_tier: string | null } | null)?.voice_clone_tier || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // load() is async — every setState inside it happens after network awaits,
    // never synchronously in the effect body; the rule can't see through the
    // call graph.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

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

  async function toggleCollection(collectionId: string) {
    if (!collectionRecording) return;
    const supabase = createClient();
    const recordingId = collectionRecording.id;
    const isMember = memberships[recordingId]?.has(collectionId);

    if (isMember) {
      await supabase
        .from("collection_recordings")
        .delete()
        .eq("collection_id", collectionId)
        .eq("recording_id", recordingId);
    } else {
      await supabase
        .from("collection_recordings")
        .insert({ collection_id: collectionId, recording_id: recordingId, position: 0 });
    }

    setMemberships((prev) => {
      const next = { ...prev };
      const set = new Set(next[recordingId] || []);
      if (isMember) set.delete(collectionId);
      else set.add(collectionId);
      next[recordingId] = set;
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteRecording) return;
    setActionPending(true);
    try {
      const res = await fetch(`/api/recordings/${deleteRecording.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
        setActionPending(false);
        return;
      }
      toast.success("Recording deleted");
      setRecordings((prev) => prev.filter((r) => r.id !== deleteRecording.id));
      setDeleteRecording(null);
    } catch {
      toast.error("Delete failed");
    }
    setActionPending(false);
  }

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <div className="mb-10">
        <p className="label text-gold-dark mb-3">Library</p>
        <h1 className="mb-2">Your Stories</h1>
        <p className="text-muted-foreground italic">
          {recordings.length} recording{recordings.length !== 1 ? "s" : ""} &middot; {totalMinutes} min total
        </p>
      </div>

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
                  ) : showEnhancedPrompt ? (
                    "Upgrade Voice"
                  ) : (
                    "Create My Voice"
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-8 opacity-40">
            <WaxSeal size={72} monogram="TP" />
          </div>
          <h2 className="mb-3">No Letters Yet</h2>
          <p className="lead italic text-muted-foreground max-w-sm">
            Record your first story and it will be sealed here, ready to share.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => {
            const story = rec.stories ?? undefined;
            const renderActions = (
              <CardActions
                onAddToCollection={() => setCollectionRecording(rec)}
                onDelete={() => setDeleteRecording(rec)}
              />
            );
            if (story && story.status === "ready") {
              return (
                <StoryCard
                  key={rec.id}
                  story={story}
                  recording={rec}
                  actions={renderActions}
                />
              );
            }
            return <RecordingCard key={rec.id} recording={rec} actions={renderActions} />;
          })}
        </div>
      )}

      {/* Add to Collection dialog */}
      <Dialog
        open={!!collectionRecording}
        onOpenChange={(open) => !open && setCollectionRecording(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">
              Add to Collection
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {collections.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-6">
                You don&apos;t have any collections yet.
              </p>
            ) : (
              collections.map((col) => {
                const isMember =
                  collectionRecording &&
                  memberships[collectionRecording.id]?.has(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleCollection(col.id)}
                    className="w-full text-left rounded-lg border border-border p-4 hover:bg-muted transition-colors flex items-center justify-between gap-3"
                  >
                    <span className="text-foreground">{col.name}</span>
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                        isMember
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {isMember && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setCollectionRecording(null)}
              className="font-heading tracking-wide"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteRecording}
        onOpenChange={(open) => !open && !actionPending && setDeleteRecording(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">
              Delete this recording?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-3">
            This permanently deletes the recording, its transcription, its
            generated story, and any audio narration. This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteRecording(null)}
              disabled={actionPending}
              className="font-heading tracking-wide"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={actionPending}
              className="font-heading tracking-wide text-destructive"
            >
              {actionPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardActions({
  onAddToCollection,
  onDelete,
}: {
  onAddToCollection: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Options"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="flex items-center justify-center h-11 w-11 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCollection();
          }}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add to Collection
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StoryCard({
  story,
  recording,
  actions,
}: {
  story: Story;
  recording: Recording;
  actions: React.ReactNode;
}) {
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
    <div className="rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/stories/${story.id}`} className="flex-1 min-w-0">
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
        </Link>
        <div className="flex items-start gap-1 flex-shrink-0">
          {actions}
          <Link
            href={`/stories/${story.id}`}
            aria-label="Open story"
            className="flex items-center justify-center h-11 w-11 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecordingCard({
  recording,
  actions,
}: {
  recording: Recording;
  actions: React.ReactNode;
}) {
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

  const hasStoryGenerating = recording.stories?.status === "generating";

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
    <div className="rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/stories/${recording.id}`} className="flex-1 min-w-0">
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
        </Link>
        <div className="flex items-start gap-1 flex-shrink-0">
          {actions}
          <Link
            href={`/stories/${recording.id}`}
            aria-label="Open recording"
            className="flex items-center justify-center h-11 w-11 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
