import { type ButtonHTMLAttributes, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "font-primary inline-flex items-center justify-center whitespace-nowrap border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      primary:
        "border-transparent bg-[var(--color-accent-green)] px-6 py-2.5 text-[13px] font-medium text-[#0A0A0A] hover:bg-emerald-400",
      secondary:
        "border-[var(--color-border-primary)] bg-transparent px-4 py-2 text-xs font-normal text-[var(--color-text-primary)] hover:bg-zinc-900",
      link: "border-[var(--color-border-primary)] bg-transparent px-3 py-1.5 text-xs font-normal text-[var(--color-text-secondary)] hover:text-[#9CA3AF]",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      icon: "size-10 p-0",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
