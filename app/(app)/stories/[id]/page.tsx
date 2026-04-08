"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Mic, Calendar } from "lucide-react";

interface Recording {
  id: string;
  duration_seconds: number;
  status: string;
  transcription: string | null;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
}

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("recordings")
        .select("id, duration_seconds, status, transcription, mime_type, file_size_bytes, created_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (data) setRecording(data as Recording);
      setLoading(false);
    }

    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground">Recording not found.</p>
        <Button variant="outline" onClick={() => router.push("/stories")} className="mt-4">
          Back to Stories
        </Button>
      </div>
    );
  }

  const date = new Date(recording.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

  const fileSizeStr =
    recording.file_size_bytes > 1_000_000
      ? `${(recording.file_size_bytes / 1_000_000).toFixed(1)} MB`
      : `${(recording.file_size_bytes / 1_000).toFixed(0)} KB`;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/stories")}
        className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </button>

      {/* Header */}
      <p className="text-base font-heading tracking-[0.25em] text-gold-dark uppercase mb-2">
        Recording
      </p>
      <h1 className="text-2xl font-heading font-semibold text-foreground mb-6">
        {formattedDate}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap gap-6 mb-8">
        <span className="flex items-center gap-2 text-base text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formattedTime}
        </span>
        <span className="flex items-center gap-2 text-base text-muted-foreground">
          <Clock className="h-4 w-4" />
          {durationStr}
        </span>
        <span className="flex items-center gap-2 text-base text-muted-foreground">
          <Mic className="h-4 w-4" />
          {fileSizeStr}
        </span>
      </div>

      {/* Status */}
      <div className="mb-8">
        <p className="text-base font-heading tracking-wider uppercase text-foreground mb-1">
          Status
        </p>
        <p className="text-base text-primary font-medium capitalize">
          {recording.status}
        </p>
      </div>

      {/* Transcription */}
      <div>
        <p className="text-base font-heading tracking-wider uppercase text-foreground mb-3">
          Transcription
        </p>
        {recording.transcription ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {recording.transcription}
            </p>
          </div>
        ) : (
          <p className="text-base text-muted-foreground italic">
            {recording.status === "transcribing"
              ? "Transcription in progress..."
              : recording.status === "failed"
              ? "Transcription failed."
              : "No transcription available."}
          </p>
        )}
      </div>
    </div>
  );
}
