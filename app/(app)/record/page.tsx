"use client";

import { useRouter } from "next/navigation";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { RecordButton } from "@/components/recording/RecordButton";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { AudioWaveform } from "@/components/recording/AudioWaveform";
import { toast } from "sonner";

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

  async function handleStop() {
    const blob = await stopRecording();
    if (!blob) return;

    // Upload
    const formData = new FormData();
    formData.append("audio", blob, `recording.${blob.type.includes("mp4") ? "mp4" : "webm"}`);
    formData.append("duration", String(duration));

    try {
      const res = await fetch("/api/recordings/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      toast.success("Recording saved!");
      router.push("/stories");
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  }

  const isRecording = state === "recording" || state === "paused";

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
        <p className="text-base text-destructive bg-destructive/10 rounded-md p-4 mb-8 max-w-sm text-center" role="alert">
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
