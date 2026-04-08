"use client";

export function RecordingTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <p className="font-heading text-2xl tracking-widest text-foreground tabular-nums">
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </p>
  );
}
