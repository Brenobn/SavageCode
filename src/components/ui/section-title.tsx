import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const sectionTitleVariants = tv({
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

export interface SectionTitleProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionTitleVariants> {
  label: string;
}

export function SectionTitle({
  className,
  label,
  tone,
  ...props
}: SectionTitleProps) {
  return (
    <div className={sectionTitleVariants({ tone, className })} {...props}>
      <span className="text-accent-green">{"//"}</span>
      <span>{label}</span>
    </div>
  );
}

export { sectionTitleVariants };
