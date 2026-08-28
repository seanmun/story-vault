"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WaxSeal } from "@/components/WaxSeal";
import { Logo } from "@/components/Logo";

export function Footer() {
  const pathname = usePathname();

  // Hide on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  // Check if inside the app
  const isAppPage =
    pathname.startsWith("/record") ||
    pathname.startsWith("/stories") ||
    pathname.startsWith("/family") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/collections");

  return (
    <footer className={`px-6 py-10 ${isAppPage ? "pb-24" : ""}`}>
      <div className="mx-auto max-w-6xl">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <WaxSeal size={56} monogram="TP" />
            <div>
              <Logo size="sm" className="text-foreground/70" />
              <p className="text-muted-foreground mt-1 italic">
                Every life has a story worth keeping.
              </p>
            </div>
          </div>
          <div className="flex gap-8 text-muted-foreground">
            {isAppPage ? (
              <>
                <Link href="/" className="hover:text-foreground transition-colors tracking-wide">
                  Home
                </Link>
                <Link href="/vision" className="hover:text-foreground transition-colors tracking-wide">
                  Vision
                </Link>
              </>
            ) : (
              <>
                <Link href="/vision" className="hover:text-foreground transition-colors tracking-wide">
                  Vision
                </Link>
                <Link href="/login" className="hover:text-foreground transition-colors tracking-wide">
                  Sign In
                </Link>
                <Link href="/signup" className="hover:text-foreground transition-colors tracking-wide">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
