import { Mic } from "lucide-react";

export default function RecordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Tell Your Story
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-xs">
        Tap the button and start talking. We&apos;ll do the rest.
      </p>

      {/* The Big Button — placeholder for Sprint 2 */}
      <button
        className="relative flex items-center justify-center w-40 h-40 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-ring/50"
        aria-label="Start recording"
      >
        <Mic className="w-16 h-16" />
      </button>

      <p className="text-sm text-muted-foreground mt-8">
        Recording will be available in Sprint 2
      </p>
    </div>
  );
}
