import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <Link
        href="/"
        className="mb-10 font-heading text-3xl tracking-[0.3em] text-primary uppercase"
      >
        StoryVault
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-10 text-base text-muted-foreground italic">
        Every life has a story worth keeping.
      </p>
    </div>
  );
}
