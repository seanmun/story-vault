"use client";

import { Mic, Square, Pause, Play, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecorderState } from "@/lib/hooks/useRecorder";

interface RecordButtonProps {
  state: RecorderState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
}

export function RecordButton({
  state,
  onStart,
  onStop,
  onPause,
  onResume,
  onDiscard,
}: RecordButtonProps) {
  if (state === "uploading" || state === "processing") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-44 h-44 rounded-full bg-primary/10">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <p className="text-base text-muted-foreground font-heading tracking-wide">
          {state === "uploading" ? "Uploading..." : "Processing..."}
        </p>
      </div>
    );
  }

  if (state === "recording" || state === "paused") {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* Stop button */}
        <button
          onClick={onStop}
          className="flex items-center justify-center w-44 h-44 rounded-full bg-destructive/90 text-white shadow-xl hover:bg-destructive transition-all focus:outline-none focus:ring-4 focus:ring-destructive/30"
          aria-label="Stop recording"
        >
          <Square className="w-12 h-12" fill="currentColor" />
        </button>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {state === "recording" ? (
            <Button
              variant="outline"
              onClick={onPause}
              className="font-heading tracking-wide"
              aria-label="Pause recording"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onResume}
              className="font-heading tracking-wide"
              aria-label="Resume recording"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onDiscard}
            className="font-heading tracking-wide text-destructive"
            aria-label="Discard recording"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Discard
          </Button>
        </div>
      </div>
    );
  }

  // Idle / error state — The Big Button
  return (
    <button
      onClick={onStart}
      className="group relative flex items-center justify-center w-44 h-44 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-ring/30"
      aria-label="Start recording"
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 rounded-full border border-gold/20 scale-110 group-hover:scale-[1.15] transition-transform duration-700" />
      <div className="absolute inset-0 rounded-full border border-gold/10 scale-[1.25] group-hover:scale-[1.3] transition-transform duration-1000" />
      <Mic className="w-14 h-14" strokeWidth={1.5} />
    </button>
  );
}
