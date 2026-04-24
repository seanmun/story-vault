import { Users } from "lucide-react";

export default function FamilyPage() {
  return (
    <div className="px-6 py-8">
      <p className="label text-gold-dark mb-2">Together</p>
      <h1 className="mb-1">Family</h1>
      <p className="text-muted-foreground mb-12">
        Share stories with your family
      </p>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border border-border mb-6">
          <Users className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="mb-2">No Family Group Yet</h2>
        <p className="text-muted-foreground max-w-xs">
          Create a family group or join one with an invite code to start sharing
          stories across generations.
        </p>
      </div>
    </div>
  );
}
