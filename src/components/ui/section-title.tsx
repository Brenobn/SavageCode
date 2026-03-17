import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const sectionTitleRootVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-sm font-bold",
  variants: {
    tone: {
      default: "text-text-primary",
      success: "text-accent-green",
      warning: "text-accent-amber",
      danger: "text-accent-red",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export interface SectionTitleRootProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionTitleRootVariants> {}

export function SectionTitleRoot({
  className,
  tone,
  ...props
}: SectionTitleRootProps) {
  return (
    <div className={sectionTitleRootVariants({ tone, className })} {...props} />
  );
}

export function SectionTitleSlash({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`text-accent-green ${className ?? ""}`} {...props}>
      {"//"}
    </span>
  );
}

export function SectionTitleText({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={className} {...props} />;
}

export { sectionTitleRootVariants };
