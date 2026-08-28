"use client";

import { Mic, Square, Pause, Play, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaxSeal } from "@/components/WaxSeal";
import type { RecorderState } from "@/lib/hooks/useRecorder";

interface RecordButtonProps {
  state: RecorderState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
}

const SEAL_SIZE = 176;

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
        <p className="text-muted-foreground font-heading tracking-wide">
          {state === "uploading" ? "Uploading..." : "Processing..."}
        </p>
      </div>
    );
  }

  if (state === "recording" || state === "paused") {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* Stop = broken seal — still wax, but with stop square */}
        <button
          onClick={onStop}
          className="group relative rounded-full outline-none focus-visible:ring-4 focus-visible:ring-destructive/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label="Stop recording"
        >
          <div className="relative transition-transform duration-300 group-hover:scale-[1.02] rounded-full">
            <WaxSeal size={SEAL_SIZE} animated={state === "recording"}>
              <Square
                className="w-12 h-12"
                fill="currentColor"
                style={{
                  color: "oklch(0.22 0.1 18)",
                  filter: "drop-shadow(0 1px 0 rgba(255, 220, 200, 0.2))",
                }}
              />
            </WaxSeal>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {state === "recording" ? (
            <Button
              variant="outline"
              size="lg"
              onClick={onPause}
              className="font-heading tracking-wide"
              aria-label="Pause recording"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={onResume}
              className="font-heading tracking-wide"
              aria-label="Resume recording"
            >
              <Play className="h-5 w-5 mr-2" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={onDiscard}
            className="font-heading tracking-wide text-destructive"
            aria-label="Discard recording"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Discard
          </Button>
        </div>
      </div>
    );
  }

  // Idle state — The Wax Seal button
  return (
    <button
      onClick={onStart}
      className="group relative rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label="Start recording — seal a letter"
    >
      {/* Decorative outer rings — the paper/envelope edge */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20 pointer-events-none transition-transform duration-700 group-hover:scale-[1.05]"
        style={{ width: SEAL_SIZE * 1.12, height: SEAL_SIZE * 1.12 }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 pointer-events-none transition-transform duration-1000 group-hover:scale-[1.05]"
        style={{ width: SEAL_SIZE * 1.28, height: SEAL_SIZE * 1.28 }}
      />

      <div className="relative transition-transform duration-500 group-hover:scale-[1.03] rounded-full">
        <WaxSeal size={SEAL_SIZE}>
          <Mic
            className="w-14 h-14"
            strokeWidth={1.5}
            style={{
              color: "oklch(0.22 0.1 18)",
              filter: "drop-shadow(0 1px 0 rgba(255, 220, 200, 0.2))",
            }}
          />
        </WaxSeal>
      </div>
    </button>
  );
}
