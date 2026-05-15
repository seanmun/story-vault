import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TextSize = "normal" | "big" | "bigger";

export const TEXT_SIZE_PX: Record<TextSize, number> = {
  normal: 18,
  big: 22,
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
