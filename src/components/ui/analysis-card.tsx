import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { StatusBadge } from "./status-badge";

const analysisCardVariants = tv({
  base: "w-full space-y-3 border border-border-primary p-5",
  variants: {
    tone: {
      critical: "bg-bg-elevated",
      warning: "bg-bg-elevated",
      good: "bg-bg-elevated",
    },
  },
  defaultVariants: {
    tone: "critical",
  },
});

export interface AnalysisCardProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof analysisCardVariants> {
  badgeLabel: string;
  description: string;
  title: string;
}

export function AnalysisCard({
  badgeLabel,
  className,
  description,
  title,
  tone,
  ...props
}: AnalysisCardProps) {
  return (
    <article className={analysisCardVariants({ tone, className })} {...props}>
      <StatusBadge label={badgeLabel} variant={tone} />

      <h3 className="font-mono text-[13px] text-text-primary">{title}</h3>

      <p className="font-sans text-xs leading-5 text-text-secondary">
        {description}
      </p>
    </article>
  );
}

export { analysisCardVariants };
