import { Mic } from "lucide-react";

export default function RecordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
      <p className="text-sm font-heading tracking-[0.3em] text-gold-dark uppercase mb-4">
        Your Story Awaits
      </p>
      <h1 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-3 text-center">
        Tell Your Story
      </h1>
      <p className="text-muted-foreground text-center mb-16 max-w-xs">
        Tap the button and start talking. We&apos;ll do the rest.
      </p>

      {/* The Big Button — placeholder for Sprint 2 */}
      <button
        className="relative flex items-center justify-center w-44 h-44 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-ring/30 group"
        aria-label="Start recording"
      >
        <div className="absolute inset-0 rounded-full border border-gold/20 scale-110 group-hover:scale-[1.15] transition-transform duration-700" />
        <div className="absolute inset-0 rounded-full border border-gold/10 scale-[1.25] group-hover:scale-[1.3] transition-transform duration-1000" />
        <Mic className="w-14 h-14" strokeWidth={1.5} />
      </button>

      <p className="text-xs text-muted-foreground mt-12 tracking-wide font-heading uppercase">
        Recording available in Sprint 2
      </p>
    </div>
  );
}
