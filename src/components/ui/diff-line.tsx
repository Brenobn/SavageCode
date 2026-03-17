import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
  base: "flex w-full items-center gap-2 px-4 py-2 font-mono text-[13px]",
  variants: {
    variant: {
      added: "bg-diff-added-bg text-text-primary",
      removed: "bg-diff-removed-bg text-text-secondary",
      context: "bg-transparent text-text-secondary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const diffPrefixVariants = tv({
  base: "w-3 shrink-0",
  variants: {
    variant: {
      added: "text-accent-green",
      removed: "text-accent-red",
      context: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

export interface DiffLineProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof diffLineVariants> {
  code: string;
}

export function DiffLine({
  className,
  code,
  variant,
  ...props
}: DiffLineProps) {
  const prefix = variant === "added" ? "+" : variant === "removed" ? "-" : " ";

  return (
    <div className={diffLineVariants({ variant, className })} {...props}>
      <span className={diffPrefixVariants({ variant })}>{prefix}</span>
      <span>{code}</span>
    </div>
  );
}

export { diffLineVariants };
