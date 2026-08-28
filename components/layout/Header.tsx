"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Mic, BookOpen, FolderOpen, Settings, LogOut } from "lucide-react";

type User = {
  email: string | null;
  displayName: string | null;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!mounted) return;

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", authUser.id)
          .single();
        if (!mounted) return;
        setUser({
          email: authUser.email ?? null,
          displayName: (profile as { display_name: string | null } | null)?.display_name ?? null,
        });
      }
      setAuthChecked(true);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser({
          email: session.user.email ?? null,
          displayName: (session.user.user_metadata?.display_name as string) ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (user?.displayName || user?.email || "T").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link
            href={user ? "/record" : "/"}
            aria-label="To Posterity"
          >
            <Logo size="sm" />
          </Link>
          <Link
            href="/changelog"
            className="text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors italic whitespace-nowrap text-xs border border-muted-foreground/30 px-2 py-0.5 rounded"
            aria-label="Changelog — Beta v0.0.4"
          >
            Beta v0.0.4
          </Link>
        </div>

        {!isAuthPage && (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {/* Logged-out: marketing nav */}
              {authChecked && !user && (
                <>
                  <Link
                    href="/vision"
                    className="font-heading font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
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
                </>
              )}

              {/* Logged-in: app nav + avatar */}
              {authChecked && user && (
                <>
                  <HeaderLink href="/record" label="Record" active={pathname.startsWith("/record")} />
                  <HeaderLink href="/stories" label="Stories" active={pathname.startsWith("/stories")} />
                  <HeaderLink href="/collections" label="Collections" active={pathname.startsWith("/collections")} />
                  <UserMenu
                    initial={initial}
                    displayName={user.displayName}
                    email={user.email}
                    onSignOut={handleSignOut}
                  />
                </>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center h-12 w-12 text-foreground"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
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
      {!isAuthPage && mobileOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <nav className="mx-auto max-w-6xl flex flex-col px-6 py-6 gap-2">
            {!user && (
              <>
                <Link
                  href="/vision"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading font-medium text-foreground tracking-wide py-3"
                >
                  Vision
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading font-medium text-muted-foreground tracking-wide py-3"
                >
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-heading tracking-wide mt-2">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {user && (
              <>
                <div className="py-3 border-b border-border mb-2">
                  <p className="font-medium text-foreground">
                    {user.displayName || "Storyteller"}
                  </p>
                  {user.email && (
                    <p className="text-muted-foreground text-sm truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                <MobileNavLink
                  href="/record"
                  icon={<Mic className="h-5 w-5" />}
                  label="Record"
                  onClick={() => setMobileOpen(false)}
                />
                <MobileNavLink
                  href="/stories"
                  icon={<BookOpen className="h-5 w-5" />}
                  label="Stories"
                  onClick={() => setMobileOpen(false)}
                />
                <MobileNavLink
                  href="/collections"
                  icon={<FolderOpen className="h-5 w-5" />}
                  label="Collections"
                  onClick={() => setMobileOpen(false)}
                />
                <MobileNavLink
                  href="/settings"
                  icon={<Settings className="h-5 w-5" />}
                  label="Settings"
                  onClick={() => setMobileOpen(false)}
                />
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 py-3 text-left text-destructive font-heading tracking-wide"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function HeaderLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`font-heading font-medium tracking-wide transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 py-3 font-heading text-foreground tracking-wide"
    >
      {icon}
      {label}
    </Link>
  );
}

function UserMenu({
  initial,
  displayName,
  email,
  onSignOut,
}: {
  initial: string;
  displayName: string | null;
  email: string | null;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-heading font-semibold transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">
              {displayName || "Storyteller"}
            </span>
            {email && (
              <span className="text-muted-foreground text-sm truncate font-normal">
                {email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/record" className="flex items-center gap-2 w-full">
            <Mic className="h-4 w-4" />
            Record
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/stories" className="flex items-center gap-2 w-full">
            <BookOpen className="h-4 w-4" />
            Stories
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/collections" className="flex items-center gap-2 w-full">
            <FolderOpen className="h-4 w-4" />
            Collections
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/settings" className="flex items-center gap-2 w-full">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
