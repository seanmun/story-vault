"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="label text-gold-dark mb-4">A Page Misplaced</p>
      <h1 className="mb-4">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md mb-10">
        Your stories are safe. This page hit a snag — trying again usually
        fixes it.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" onClick={reset} className="font-heading tracking-wide">
          <RotateCcw className="h-5 w-5 mr-2" />
          Try Again
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => window.location.assign("/stories")}
          className="font-heading tracking-wide"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Stories
        </Button>
      </div>
    </div>
  );
}
