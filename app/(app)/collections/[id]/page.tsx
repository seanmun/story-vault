"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Clock, Trash2, GripVertical } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

interface CollectionRecording {
  recording_id: string;
  position: number;
  recording: {
    id: string;
    duration_seconds: number;
    status: string;
    transcription: string | null;
    created_at: string;
  };
}

interface AvailableRecording {
  id: string;
  duration_seconds: number;
  transcription: string | null;
  created_at: string;
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [recordings, setRecordings] = useState<CollectionRecording[]>([]);
  const [available, setAvailable] = useState<AvailableRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Load collection
    const { data: colData } = await supabase
      .from("collections")
      .select("id, name, description")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (colData) setCollection(colData as Collection);

    // Load recordings in this collection
    const { data: crData } = await supabase
      .from("collection_recordings")
      .select("recording_id, position, recording:recordings(id, duration_seconds, status, transcription, created_at)")
      .eq("collection_id", id)
      .order("position", { ascending: true });

    if (crData) setRecordings(crData as unknown as CollectionRecording[]);

    setLoading(false);
  }

  async function loadAvailable() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get all user recordings not already in this collection
    const existingIds = recordings.map((r) => r.recording_id);

    const { data } = await supabase
      .from("recordings")
      .select("id, duration_seconds, transcription, created_at")
      .eq("user_id", user.id)
      .not("id", "in", `(${existingIds.length > 0 ? existingIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
      .order("created_at", { ascending: false });

    if (data) setAvailable(data as AvailableRecording[]);
  }

  async function addRecording(recordingId: string) {
    const nextPosition = recordings.length;
    await supabase.from("collection_recordings").insert({
      collection_id: id,
      recording_id: recordingId,
      position: nextPosition,
    });
    setDialogOpen(false);
    load();
  }

  async function removeRecording(recordingId: string) {
    await supabase
      .from("collection_recordings")
      .delete()
      .eq("collection_id", id)
      .eq("recording_id", recordingId);
    load();
  }

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground">Collection not found.</p>
        <Button variant="outline" onClick={() => router.push("/collections")} className="mt-4">
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/collections")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </button>

      <div className="flex items-start justify-between mb-10 gap-4">
        <div>
          <p className="label text-gold-dark mb-3">Collection</p>
          <h1 className="mb-2">{collection.name}</h1>
          {collection.description && (
            <p className="text-muted-foreground italic">{collection.description}</p>
          )}
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open) loadAvailable();
          }}
        >
          <DialogTrigger
            className={buttonVariants({ className: "font-heading tracking-wide" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Recording
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading tracking-wide">
                Add a Recording
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
              {available.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No recordings available to add. Record a new story first!
                </p>
              ) : (
                available.map((rec) => {
                  const date = new Date(rec.created_at);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const mins = Math.floor(rec.duration_seconds / 60);
                  const secs = rec.duration_seconds % 60;
                  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                  const preview = rec.transcription
                    ? rec.transcription.slice(0, 80) + (rec.transcription.length > 80 ? "..." : "")
                    : "No transcription";

                  return (
                    <button
                      key={rec.id}
                      onClick={() => addRecording(rec.id)}
                      className="w-full text-left rounded-lg border border-border p-4 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-foreground">
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {durationStr}
                        </span>
                      </div>
                      <p className="text-muted-foreground italic truncate">
                        {preview}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recordings list */}
      {recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="mb-2">No recordings yet</h3>
          <p className="text-muted-foreground max-w-xs">
            Add recordings to this collection to build your story.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((cr, index) => {
            const rec = cr.recording;
            if (!rec) return null;

            const date = new Date(rec.created_at);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const mins = Math.floor(rec.duration_seconds / 60);
            const secs = rec.duration_seconds % 60;
            const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
            const preview = rec.transcription
              ? rec.transcription.slice(0, 100) + (rec.transcription.length > 100 ? "..." : "")
              : "No transcription";

            return (
              <div
                key={cr.recording_id}
                className="rounded-lg border border-border bg-card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <GripVertical className="h-4 w-4" />
                    <span className="font-heading font-semibold w-6 text-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground">
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {durationStr}
                      </span>
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;{preview}&rdquo;
                    </p>
                  </div>
                  <button
                    onClick={() => removeRecording(cr.recording_id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    aria-label="Remove from collection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
