import { notFound } from "next/navigation";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Placeholder — full implementation in Sprint 3
  if (!id) notFound();

  return (
    <div className="px-4 py-6">
      <p className="text-muted-foreground">
        Story view will be available in Sprint 3
      </p>
    </div>
  );
}
