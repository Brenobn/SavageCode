import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const statusBadgeVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-xs",
  variants: {
    variant: {
      critical: "text-accent-red",
      warning: "text-accent-amber",
      good: "text-accent-green",
      muted: "text-text-secondary",
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});

const statusBadgeDotVariants = tv({
  base: "size-2 rounded-full",
  variants: {
    variant: {
      critical: "bg-accent-red",
      warning: "bg-accent-amber",
      good: "bg-accent-green",
      muted: "bg-text-secondary",
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: string;
}

export function StatusBadge({
  className,
  label,
  variant,
  ...props
}: StatusBadgeProps) {
  return (
    <div className={statusBadgeVariants({ variant, className })} {...props}>
      <span aria-hidden className={statusBadgeDotVariants({ variant })} />
      <span>{label}</span>
    </div>
  );
}

export { statusBadgeVariants };
