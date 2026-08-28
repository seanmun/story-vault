import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TextSize = "normal" | "big" | "bigger";

// Must stay in sync with globals.css: the body default is 20px, so "Normal"
// must be 20 — a smaller value would make the accessibility widget SHRINK text.
export const TEXT_SIZE_PX: Record<TextSize, number> = {
  normal: 20,
  big: 24,
  bigger: 28,
};

interface AccessibilityState {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  reset: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      textSize: "normal",
      setTextSize: (textSize) => set({ textSize }),
      reset: () => set({ textSize: "normal" }),
    }),
    { name: "toposterity-accessibility" }
  )
);
