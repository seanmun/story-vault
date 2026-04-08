import { BookOpen } from "lucide-react";

export default function StoriesPage() {
  return (
    <div className="px-6 py-8">
      <p className="text-xs font-heading tracking-[0.25em] text-gold-dark uppercase mb-2">
        Library
      </p>
      <h1 className="text-2xl font-heading font-semibold text-foreground mb-1">
        Your Stories
      </h1>
      <p className="text-muted-foreground mb-12">
        Recorded stories will appear here
      </p>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border border-border mb-6">
          <BookOpen className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
          No Stories Yet
        </h2>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Record your first story and it will appear here, polished and ready to
          share with your family.
        </p>
      </div>
    </div>
  );
}
