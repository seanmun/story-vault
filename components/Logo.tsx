import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  as?: "span" | "h1" | "p";
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-5xl md:text-6xl",
  xl: "text-6xl md:text-7xl lg:text-8xl",
};

/**
 * "To Posterity" brand logo in IM Fell English (17th century typeface).
 * Use across header, footer, hero, and emails for consistent brand presence.
 */
export function Logo({ size = "md", className, as: Tag = "span" }: LogoProps) {
  return (
    <Tag
      className={cn(
        "font-logo text-primary leading-none",
        sizeMap[size],
        className
      )}
      style={{ fontStyle: "italic", letterSpacing: "0.01em" }}
    >
      To Posterity
    </Tag>
  );
}
