import { WaxSeal } from "@/components/WaxSeal";

export default function FamilyPage() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <div className="mb-10">
        <p className="label text-gold-dark mb-3">Together</p>
        <h1 className="mb-2">Family</h1>
        <p className="text-muted-foreground italic">
          Share stories with your family
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-8 opacity-40">
          <WaxSeal size={72} monogram="TP" />
        </div>
        <h2 className="mb-3">No Family Group Yet</h2>
        <p className="lead italic text-muted-foreground max-w-sm">
          Create a family group or join one with an invite code to start
          sharing letters across generations.
        </p>
      </div>
    </div>
  );
}
