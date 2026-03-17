import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const tableRowVariants = tv({
  base: "flex w-full items-center gap-6 border-b border-border-primary px-5 py-4 font-mono",
  variants: {
    scoreTone: {
      critical: "",
      warning: "",
      good: "",
      muted: "",
    },
  },
  defaultVariants: {
    scoreTone: "muted",
  },
});

const scoreTextVariants = tv({
  base: "text-[13px] font-bold",
  variants: {
    scoreTone: {
      critical: "text-accent-red",
      warning: "text-accent-amber",
      good: "text-accent-green",
      muted: "text-text-secondary",
    },
  },
  defaultVariants: {
    scoreTone: "muted",
  },
});

export interface TableRowRootProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableRowVariants> {}

export function TableRowRoot({
  className,
  scoreTone,
  ...props
}: TableRowRootProps) {
  return (
    <div className={tableRowVariants({ scoreTone, className })} {...props} />
  );
}

export function TableRowRank({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`w-10 text-[13px] text-text-tertiary ${className ?? ""}`}
      {...props}
    />
  );
}

export interface TableRowScoreProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof scoreTextVariants> {}

export function TableRowScore({
  className,
  scoreTone,
  ...props
}: TableRowScoreProps) {
  return (
    <span className={scoreTextVariants({ scoreTone, className })} {...props} />
  );
}

export function TableRowCode({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`min-w-0 flex-1 text-xs text-text-secondary ${className ?? ""}`}
      {...props}
    />
  );
}

export function TableRowLanguage({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`w-25 text-xs text-text-tertiary ${className ?? ""}`}
      {...props}
    />
  );
}

export { tableRowVariants };
