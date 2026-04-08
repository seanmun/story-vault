"use client";

import { useRouter } from "next/navigation";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { RecordButton } from "@/components/recording/RecordButton";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { AudioWaveform } from "@/components/recording/AudioWaveform";
import { toast } from "sonner";

const MAX_DURATION_MINUTES = 10;
const MAX_DURATION_SECONDS = MAX_DURATION_MINUTES * 60;

export default function RecordPage() {
  const router = useRouter();
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

  // Auto-stop at max duration
  if (duration >= MAX_DURATION_SECONDS && state === "recording") {
    handleStop();
  }

  async function handleStop() {
    const blob = await stopRecording();
    if (!blob) return;

    // Check file size — Vercel limit is ~4.5MB for free, 100MB for pro
    const sizeMB = blob.size / (1024 * 1024);
    if (sizeMB > 95) {
      toast.error(
        `Recording is too large (${sizeMB.toFixed(1)}MB). Try a shorter recording.`
      );
      return;
    }

    // Upload
    const formData = new FormData();
    formData.append(
      "audio",
      blob,
      `recording.${blob.type.includes("mp4") ? "mp4" : "webm"}`
    );
    formData.append("duration", String(duration));

    try {
      const res = await fetch("/api/recordings/upload", {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) {
        toast.error(
          "Recording is too large to upload. Try a shorter recording (under 10 minutes)."
        );
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      toast.success("Recording saved! Transcribing...");

      // Trigger transcription, then story generation
      fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId: data.id }),
      })
        .then((r) => r.json())
        .then((result) => {
          if (result.transcription) {
            toast.success("Transcription complete! Generating your story...");

            // Trigger story generation
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
      toast.error("Upload failed. Please try again.");
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
          <p className="text-base font-heading tracking-[0.3em] text-gold-dark uppercase mb-4">
            Your Story Awaits
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-3 text-center">
            Tell Your Story
          </h1>
          <p className="text-muted-foreground text-center mb-16 max-w-xs">
            Tap the button and start talking. We&apos;ll do the rest.
          </p>
        </>
      )}

      {/* Recording status */}
      {isRecording && (
        <div className="flex flex-col items-center mb-8">
          <p className="text-base font-heading tracking-[0.3em] text-primary uppercase mb-4">
            {state === "paused" ? "Paused" : "Recording"}
          </p>
          <RecordingTimer seconds={duration} />

          {/* Time remaining warning */}
          {isNearLimit && (
            <p className="text-base text-destructive mt-2">
              {remainingSeconds > 0
                ? `${remainingSeconds}s remaining`
                : "Maximum reached — stopping..."}
            </p>
          )}

          {/* Max duration note */}
          {!isNearLimit && (
            <p className="text-base text-muted-foreground mt-2">
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
          className="text-base text-destructive bg-destructive/10 rounded-md p-4 mb-8 max-w-sm text-center"
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
