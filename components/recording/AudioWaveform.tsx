"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export function AudioWaveform({ analyser, isActive }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      if (!ctx || !canvas || !analyser) return;
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw bars radiating from center
      const barCount = 40;
      const barWidth = width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(4, value * (height * 0.4));

        // Use CSS variable color
        ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("color");

        // Top bar
        ctx.fillRect(
          i * barWidth + gap / 2,
          centerY - barHeight,
          barWidth - gap,
          barHeight
        );
        // Bottom bar (mirror)
        ctx.fillRect(
          i * barWidth + gap / 2,
          centerY,
          barWidth - gap,
          barHeight
        );
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      className="w-full max-w-xs h-20 text-primary/60"
      aria-hidden="true"
    />
  );
}
