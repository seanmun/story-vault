import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccessibilityState {
  fontSize: number; // 16-32px
  lineHeight: number; // 1.4-2.4
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  increaseLineHeight: () => void;
  decreaseLineHeight: () => void;
  reset: () => void;
}

const DEFAULTS = {
  fontSize: 20,
  lineHeight: 1.7,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontSize: DEFAULTS.fontSize,
      lineHeight: DEFAULTS.lineHeight,
      setFontSize: (size) =>
        set({ fontSize: Math.min(32, Math.max(16, size)) }),
      setLineHeight: (height) =>
        set({ lineHeight: Math.min(2.4, Math.max(1.4, height)) }),
      increaseFontSize: () =>
        set((s) => ({ fontSize: Math.min(32, s.fontSize + 2) })),
      decreaseFontSize: () =>
        set((s) => ({ fontSize: Math.max(16, s.fontSize - 2) })),
      increaseLineHeight: () =>
        set((s) => ({ lineHeight: Math.min(2.4, +(s.lineHeight + 0.2).toFixed(1)) })),
      decreaseLineHeight: () =>
        set((s) => ({ lineHeight: Math.max(1.4, +(s.lineHeight - 0.2).toFixed(1)) })),
      reset: () => set(DEFAULTS),
    }),
    { name: "storyvault-accessibility" }
  )
);
