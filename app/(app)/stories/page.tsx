import { BookOpen } from "lucide-react";

export default function StoriesPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">Your Stories</h1>
      <p className="text-muted-foreground mb-8">
        Your recorded stories will appear here
      </p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          No stories yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Record your first story and it will appear here, polished and ready to
          share.
        </p>
      </div>
    </div>
  );
}
