"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAccessibilityStore } from "@/lib/stores/accessibility-store";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Sun,
  Moon,
  Plus,
  Minus,
  RotateCcw,
  X,
  Type,
  AlignJustify,
} from "lucide-react";

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const {
    fontSize,
    lineHeight,
    increaseFontSize,
    decreaseFontSize,
    increaseLineHeight,
    decreaseLineHeight,
    reset,
  } = useAccessibilityStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply font size and line height to the document
  useEffect(() => {
    document.documentElement.style.setProperty("--user-font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--user-line-height", `${lineHeight}`);
  }, [fontSize, lineHeight]);

  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button — top right, just under header */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-24 right-6 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-ring/30"
        aria-label={open ? "Close accessibility settings" : "Open accessibility settings"}
      >
        {open ? (
          <X className="h-4 w-4" />
        ) : (
          <Settings2 className="h-4 w-4" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed top-36 right-6 z-[60] w-80 rounded-xl border border-border bg-card shadow-2xl"
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div className="p-6 space-y-6">
            <h2 className="font-heading text-lg tracking-wide font-semibold text-foreground">
              Accessibility
            </h2>

            {/* Theme Toggle */}
            <div>
              <p className="text-base font-medium text-foreground mb-3">
                Display Mode
              </p>
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

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-gold-dark" />
                  <p className="text-base font-medium text-foreground">
                    Font Size
                  </p>
                </div>
                <span className="text-base text-muted-foreground font-heading">
                  {fontSize}px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 16}
                  aria-label="Decrease font size"
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 rounded-full bg-muted relative">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${((fontSize - 16) / 16) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 32}
                  aria-label="Increase font size"
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlignJustify className="h-4 w-4 text-gold-dark" />
                  <p className="text-base font-medium text-foreground">
                    Line Spacing
                  </p>
                </div>
                <span className="text-base text-muted-foreground font-heading">
                  {lineHeight.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseLineHeight}
                  disabled={lineHeight <= 1.4}
                  aria-label="Decrease line spacing"
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 rounded-full bg-muted relative">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${((lineHeight - 1.4) / 1.0) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseLineHeight}
                  disabled={lineHeight >= 2.4}
                  aria-label="Increase line spacing"
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
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
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
