import { Users } from "lucide-react";

export default function FamilyPage() {
  return (
    <div className="px-6 py-8">
      <p className="text-xs font-heading tracking-[0.25em] text-gold-dark uppercase mb-2">
        Together
      </p>
      <h1 className="text-2xl font-heading font-semibold text-foreground mb-1">
        Family
      </h1>
      <p className="text-muted-foreground mb-12">
        Share stories with your family
      </p>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border border-border mb-6">
          <Users className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
          No Family Group Yet
        </h2>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Create a family group or join one with an invite code to start sharing
          stories across generations.
        </p>
      </div>
    </div>
  );
}
