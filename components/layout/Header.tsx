"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide on auth pages — they have their own branding
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  // Check if inside the app (authenticated pages)
  const isAppPage =
    pathname.startsWith("/record") ||
    pathname.startsWith("/stories") ||
    pathname.startsWith("/family") ||
    pathname.startsWith("/settings");

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link
          href={isAppPage ? "/record" : "/"}
          className="font-heading text-2xl tracking-widest text-primary uppercase"
        >
          StoryVault
        </Link>

        {!isAppPage && (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/vision"
                className="text-base font-heading font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                Vision
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-heading tracking-wide">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="font-heading tracking-wide">
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 text-foreground"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Mobile menu panel */}
      {!isAppPage && mobileOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <nav className="mx-auto max-w-6xl flex flex-col px-6 py-6 gap-4">
            <Link
              href="/vision"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-heading font-medium text-foreground tracking-wide py-2"
            >
              Vision
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-heading font-medium text-muted-foreground tracking-wide py-2"
            >
              Sign In
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full font-heading tracking-wide">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
