"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { RecordButton } from "@/components/recording/RecordButton";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { AudioWaveform } from "@/components/recording/AudioWaveform";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const MAX_DURATION_MINUTES = 10;
const MAX_DURATION_SECONDS = MAX_DURATION_MINUTES * 60;

export default function RecordPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    state,
    duration,
    error,
    analyserNode,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording,
  } = useRecorder();

  // Auto-stop at max duration. Must run in an effect, not the render body —
  // stopping the recorder during render fires side effects mid-render and can
  // double-run under StrictMode. The ref guards against re-firing while the
  // recorder state catches up.
  const autoStopFired = useRef(false);
  useEffect(() => {
    if (duration < MAX_DURATION_SECONDS) {
      autoStopFired.current = false;
      return;
    }
    if (state === "recording" && !autoStopFired.current) {
      autoStopFired.current = true;
      handleStop();
    }
    // handleStop is recreated each render; duration/state are the real triggers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, state]);

  async function handleStop() {
    const blob = await stopRecording();
    if (!blob) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be signed in to save recordings.");
      discardRecording();
      return;
    }

    // Upload directly to Supabase Storage (bypasses Vercel size limits).
    // Retry transient failures — this blob is irreplaceable.
    const fileExt = blob.type.includes("mp4") ? "mp4" : "webm";
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // MediaRecorder produces parameterized types like "audio/webm;codecs=opus",
    // which bucket MIME allowlists reject (exact subtype match). Re-wrap with
    // the base type — the storage client uses the Blob's own type, not the
    // contentType option, for Blob bodies.
    const baseType = blob.type.split(";")[0].trim() || "audio/webm";
    const uploadBlob = new Blob([blob], { type: baseType });

    toast.info("Uploading recording...");

    let uploadError: { message: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.storage
        .from("recordings")
        .upload(fileName, uploadBlob, {
          contentType: baseType,
          upsert: true,
        });
      uploadError = error;
      if (!error) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      discardRecording();
      return;
    }

    // Create database record via lightweight API route
    try {
      let res: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await fetch("/api/recordings/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storagePath: fileName,
              durationSeconds: duration,
              mimeType: blob.type,
            }),
          });
          if (res.status < 500) break;
        } catch {
          res = null;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!res) {
        toast.error("Failed to save recording. Please try again.");
        discardRecording();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save recording");
        discardRecording();
        return;
      }

      if (data.queued) {
        // The durable server-side pipeline has it from here.
        toast.success(
          "Recording saved! Your story is being written — it will appear in Stories shortly."
        );
        router.push("/stories");
        return;
      }

      toast.success("Recording saved! Transcribing...");

      // Fallback: drive the pipeline from the client (works without
      // Trigger.dev; the reaper also re-queues anything stranded).
      fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId: data.id }),
      })
        .then((r) => r.json())
        .then((result) => {
          if (result.transcription) {
            toast.success("Transcription complete! Generating your story...");

            fetch("/api/stories/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recordingId: data.id }),
            })
              .then((r) => r.json())
              .then((storyResult) => {
                if (storyResult.title) {
                  toast.success(`Story ready: "${storyResult.title}"`);
                } else if (storyResult.error) {
                  toast.error("Story generation failed: " + storyResult.error);
                }
              })
              .catch(() => {
                toast.error("Story generation failed.");
              });
          } else if (result.error) {
            toast.error("Transcription failed: " + result.error);
          }
        })
        .catch(() => {
          toast.error("Transcription failed.");
        });

      router.push("/stories");
    } catch {
      toast.error("Failed to save recording. Please try again.");
      discardRecording();
    }
  }

  const isRecording = state === "recording" || state === "paused";
  const remainingSeconds = MAX_DURATION_SECONDS - duration;
  const isNearLimit = remainingSeconds <= 60 && isRecording;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      {/* Header text */}
      {!isRecording && state !== "uploading" && state !== "processing" && (
        <>
          <p className="label text-gold-dark mb-4">Your Story Awaits</p>
          <h1 className="mb-4 text-center">Tell Your Story</h1>
          <p className="lead italic text-muted-foreground text-center mb-16 max-w-sm">
            Tap the seal and start talking.
          </p>
        </>
      )}

      {/* Recording status */}
      {isRecording && (
        <div className="flex flex-col items-center mb-8">
          <p className="label text-primary mb-4">
            {state === "paused" ? "Paused" : "Recording"}
          </p>
          <RecordingTimer seconds={duration} />

          {/* Time remaining warning */}
          {isNearLimit && (
            <p className="text-destructive mt-2">
              {remainingSeconds > 0
                ? `${remainingSeconds}s remaining`
                : "Maximum reached — stopping..."}
            </p>
          )}

          {/* Max duration note */}
          {!isNearLimit && (
            <p className="text-muted-foreground mt-2">
              Up to {MAX_DURATION_MINUTES} minutes per recording
            </p>
          )}

          <div className="mt-6">
            <AudioWaveform
              analyser={analyserNode}
              isActive={state === "recording"}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          className="text-destructive bg-destructive/10 rounded-md p-4 mb-8 max-w-sm text-center"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* The Big Button */}
      <RecordButton
        state={state}
        onStart={startRecording}
        onStop={handleStop}
        onPause={pauseRecording}
        onResume={resumeRecording}
        onDiscard={discardRecording}
      />
    </div>
  );
}
