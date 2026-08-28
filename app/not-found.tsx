import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="label text-gold-dark mb-4">Lost in the Archive</p>
      <h1 className="mb-4">Page not found</h1>
      <p className="text-muted-foreground max-w-md mb-10">
        This page doesn&rsquo;t exist — or it hasn&rsquo;t been written yet.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "lg" }),
          "font-heading tracking-wide"
        )}
      >
        <Home className="h-5 w-5 mr-2" />
        Back Home
      </Link>
    </div>
  );
}
