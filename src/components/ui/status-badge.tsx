import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const statusBadgeRootVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-xs",
  variants: {
    tone: {
      critical: "text-accent-red",
      warning: "text-accent-amber",
      good: "text-accent-green",
      muted: "text-text-secondary",
    },
  },
  defaultVariants: {
    tone: "muted",
  },
});

const statusBadgeDotVariants = tv({
  base: "size-2 rounded-full",
  variants: {
    tone: {
      critical: "bg-accent-red",
      warning: "bg-accent-amber",
      good: "bg-accent-green",
      muted: "bg-text-secondary",
    },
  },
  defaultVariants: {
    tone: "muted",
  },
});

export interface StatusBadgeRootProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeRootVariants> {}

export function StatusBadgeRoot({
  className,
  tone,
  ...props
}: StatusBadgeRootProps) {
  return (
    <div className={statusBadgeRootVariants({ tone, className })} {...props} />
  );
}

export interface StatusBadgeDotProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeDotVariants> {}

export function StatusBadgeDot({
  className,
  tone,
  ...props
}: StatusBadgeDotProps) {
  return (
    <span
      aria-hidden
      className={statusBadgeDotVariants({ tone, className })}
      {...props}
    />
  );
}

export function StatusBadgeText({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={className} {...props} />;
}

export { statusBadgeDotVariants, statusBadgeRootVariants };
