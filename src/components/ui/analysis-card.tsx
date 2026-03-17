import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import {
  StatusBadgeDot,
  StatusBadgeRoot,
  StatusBadgeText,
} from "./status-badge";

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

export interface AnalysisCardRootProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof analysisCardVariants> {}

export function AnalysisCardRoot({
  className,
  tone,
  ...props
}: AnalysisCardRootProps) {
  return (
    <article className={analysisCardVariants({ tone, className })} {...props} />
  );
}

export interface AnalysisCardBadgeProps {
  children: string;
  tone?: VariantProps<typeof analysisCardVariants>["tone"];
}

export function AnalysisCardBadge({
  children,
  tone = "critical",
}: AnalysisCardBadgeProps) {
  return (
    <StatusBadgeRoot tone={tone}>
      <StatusBadgeDot tone={tone} />
      <StatusBadgeText>{children}</StatusBadgeText>
    </StatusBadgeRoot>
  );
}

export function AnalysisCardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-mono text-[13px] text-text-primary ${className ?? ""}`}
      {...props}
    />
  );
}

export function AnalysisCardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`font-sans text-xs leading-5 text-text-secondary ${className ?? ""}`}
      {...props}
    />
  );
}

export { analysisCardVariants };
