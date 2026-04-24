import { cn } from "@/lib/utils";

interface WaxSealProps {
  size?: number;
  children?: React.ReactNode;
  monogram?: string;
  className?: string;
  animated?: boolean;
}

/**
 * Pure CSS wax seal — deep wine-red with embossed center content.
 * Use as a visual element or background for interactive elements.
 */
export function WaxSeal({
  size = 80,
  children,
  monogram,
  className,
  animated = false,
}: WaxSealProps) {
  const fontSize = size * 0.32;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Drip — subtle organic extension at bottom */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          bottom: -size * 0.08,
          left: "50%",
          transform: "translateX(-50%)",
          width: size * 0.55,
          height: size * 0.25,
          background:
            "radial-gradient(ellipse at center top, oklch(0.38 0.14 22) 0%, oklch(0.30 0.13 20) 60%, transparent 100%)",
          borderRadius: "0 0 50% 50% / 0 0 100% 100%",
          filter: "blur(0.5px)",
          opacity: 0.85,
          zIndex: 0,
        }}
      />

      {/* Main seal body */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center overflow-hidden",
          animated && "seal-pulse"
        )}
        style={{
          width: size,
          height: size,
          background: `
            radial-gradient(circle at 35% 30%, oklch(0.55 0.14 22) 0%, oklch(0.42 0.14 22) 30%, oklch(0.32 0.13 20) 70%, oklch(0.26 0.12 20) 100%),
            radial-gradient(circle at 70% 80%, oklch(0.28 0.12 18) 0%, transparent 50%)
          `,
          boxShadow: `
            0 ${size * 0.06}px ${size * 0.15}px rgba(40, 10, 10, 0.45),
            inset 0 ${size * 0.03}px ${size * 0.06}px rgba(255, 220, 200, 0.12),
            inset 0 -${size * 0.04}px ${size * 0.08}px rgba(20, 5, 5, 0.45),
            inset ${size * 0.02}px 0 ${size * 0.04}px rgba(255, 220, 200, 0.06),
            inset -${size * 0.02}px 0 ${size * 0.04}px rgba(20, 5, 5, 0.3)
          `,
          zIndex: 1,
        }}
      >
        {/* Texture layer — subtle wax imperfections */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255, 200, 180, 0.08) 0%, transparent 15%),
              radial-gradient(circle at 75% 60%, rgba(40, 10, 10, 0.15) 0%, transparent 20%),
              radial-gradient(circle at 60% 20%, rgba(255, 200, 180, 0.06) 0%, transparent 10%),
              radial-gradient(circle at 30% 75%, rgba(40, 10, 10, 0.10) 0%, transparent 25%)
            `,
            mixBlendMode: "overlay",
          }}
        />

        {/* Inner embossed ring */}
        <div
          aria-hidden="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: size * 0.08,
            border: `${Math.max(1, size * 0.008)}px solid rgba(40, 10, 10, 0.35)`,
            boxShadow: "inset 0 1px 1px rgba(255, 220, 200, 0.1)",
          }}
        />

        {/* Center content — monogram or children, embossed */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{
            color: "oklch(0.22 0.1 18)",
            textShadow: `
              0 ${Math.max(1, size * 0.015)}px 0 rgba(255, 220, 200, 0.22),
              0 -${Math.max(1, size * 0.01)}px ${size * 0.015}px rgba(20, 5, 5, 0.5)
            `,
            fontFamily: "var(--font-cinzel), serif",
            fontWeight: 700,
            fontSize: monogram ? fontSize : undefined,
            letterSpacing: "0.05em",
          }}
        >
          {children || monogram}
        </div>
      </div>

      <style>{`
        .seal-pulse {
          animation: seal-pulse 2.4s ease-in-out infinite;
        }
        @keyframes seal-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
      `}</style>
    </div>
  );
}
