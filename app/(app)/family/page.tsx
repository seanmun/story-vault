import { Users } from "lucide-react";

export default function FamilyPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">Family</h1>
      <p className="text-muted-foreground mb-8">
        Share stories with your family
      </p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          No family group yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Create a family group or join one with an invite code to start sharing
          stories.
        </p>
      </div>
    </div>
  );
}
