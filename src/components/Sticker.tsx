import { cn } from "@/lib/utils";

const VARIANTS = {
  pink: "bg-primary/15 text-primary",
  lavender: "bg-secondary text-secondary-foreground",
  mint: "bg-accent text-accent-foreground",
  sunshine: "bg-warning/30 text-warning-foreground",
  cream: "bg-card text-foreground",
} as const;

const SIZES = {
  sm: "h-9 w-9 text-base",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-4xl",
} as const;

/**
 * A little scrapbook-style emoji sticker — the app's signature decorative
 * element. Drop it anywhere with absolute positioning to scatter stickers
 * around a layout, e.g.:
 *
 *   <div className="relative">
 *     <Sticker emoji="✨" className="absolute -top-3 -left-3" />
 *   </div>
 */
export function Sticker({
  emoji,
  variant = "pink",
  size = "md",
  rotate = -8,
  wiggle = false,
  className,
}: {
  emoji: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Degrees to rotate the sticker for that "stuck on by hand" look. */
  rotate?: number;
  /** Gently wiggle back and forth (respects prefers-reduced-motion). */
  wiggle?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "sticker pointer-events-none inline-grid select-none place-items-center rounded-full",
        SIZES[size],
        VARIANTS[variant],
        wiggle && "animate-wiggle",
        className,
      )}
      style={
        {
          transform: wiggle ? undefined : `rotate(${rotate}deg)`,
          "--wiggle-from": `${rotate - 6}deg`,
          "--wiggle-to": `${rotate + 6}deg`,
        } as React.CSSProperties
      }
    >
      {emoji}
    </span>
  );
}
