"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Mic, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Recording {
  id: string;
  duration_seconds: number;
  status: string;
  transcription: string | null;
  created_at: string;
}

export default function StoriesPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadRecordings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("recordings")
        .select("id, duration_seconds, status, transcription, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setRecordings(data as Recording[]);
      setLoading(false);
    }

    loadRecordings();
  }, [supabase]);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <p className="text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-2">
        Library
      </p>
      <h1 className="text-2xl font-heading font-semibold text-foreground mb-1">
        Your Stories
      </h1>
      <p className="text-muted-foreground mb-8">
        {recordings.length} recording{recordings.length !== 1 ? "s" : ""}
      </p>

      {recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full border border-border mb-6">
            <BookOpen className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
            No Stories Yet
          </h2>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            Record your first story and it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => (
            <RecordingCard key={rec.id} recording={rec} />
          ))}
        </div>
      )}
    </div>
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
  const durationStr =
    mins > 0
      ? `${mins}m ${secs}s`
      : `${secs}s`;

  const statusLabel: Record<string, string> = {
    uploading: "Uploading",
    uploaded: "Uploaded",
    transcribing: "Transcribing...",
    transcribed: "Transcribed",
    failed: "Failed",
  };

  const statusColor: Record<string, string> = {
    uploading: "text-muted-foreground",
    uploaded: "text-muted-foreground",
    transcribing: "text-gold-dark",
    transcribed: "text-primary",
    failed: "text-destructive",
  };

  // Preview of transcription — first ~100 chars
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
            {/* Date and time */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-base font-heading font-semibold text-foreground">
                {formattedDate}
              </span>
              <span className="text-base text-muted-foreground">
                {formattedTime}
              </span>
            </div>

            {/* Duration and status */}
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-base text-muted-foreground">
                <Clock className="h-4 w-4" />
                {durationStr}
              </span>
              <span className="flex items-center gap-1.5 text-base">
                <Mic className="h-4 w-4" />
                <span className={statusColor[recording.status] || "text-muted-foreground"}>
                  {statusLabel[recording.status] || recording.status}
                </span>
              </span>
            </div>

            {/* Transcription preview */}
            {preview && (
              <p className="text-base text-muted-foreground leading-relaxed italic">
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
