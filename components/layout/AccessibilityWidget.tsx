"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  useAccessibilityStore,
  TEXT_SIZE_PX,
  type TextSize,
} from "@/lib/stores/accessibility-store";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Sun,
  Moon,
  RotateCcw,
  X,
} from "lucide-react";

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "big", label: "Big" },
  { value: "bigger", label: "Bigger" },
];

// Hydration-safe "mounted" flag: false during SSR/hydration, true after.
const emptySubscribe = () => () => {};

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { theme, setTheme } = useTheme();
  const { textSize, setTextSize, reset } = useAccessibilityStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Dialog behavior: move focus into the panel on open, close on Escape and
  // return focus to the toggle so keyboard users aren't stranded.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Apply body text size via CSS custom property — scales body content only,
  // not layout/hero/buttons.
  useEffect(() => {
    const px = TEXT_SIZE_PX[textSize];
    document.documentElement.style.setProperty("--user-body-size", `${px}px`);
  }, [textSize]);

  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button — top right, just under header */}
      <button
        ref={toggleRef}
        onClick={() => setOpen(!open)}
        className="fixed top-24 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all hover:scale-105 outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        aria-label={
          open ? "Close accessibility settings" : "Open accessibility settings"
        }
        aria-expanded={open}
        aria-controls="accessibility-panel"
      >
        {open ? <X className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          tabIndex={-1}
          className="fixed top-36 right-6 z-[60] w-80 rounded-xl border border-border bg-card shadow-2xl outline-none"
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div className="p-6 space-y-6">
            <p className="font-heading tracking-wide text-foreground text-base font-semibold">
              Accessibility
            </p>

            {/* Text Size */}
            <div>
              <p className="font-medium text-foreground mb-3">Text Size</p>
              <div className="grid grid-cols-3 gap-2">
                {TEXT_SIZE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={textSize === option.value ? "default" : "outline"}
                    className="font-heading tracking-wide"
                    onClick={() => setTextSize(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <p className="font-medium text-foreground mb-3">Display Mode</p>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex-1 font-heading tracking-wide"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex-1 font-heading tracking-wide"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              className="w-full font-heading tracking-wide"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
