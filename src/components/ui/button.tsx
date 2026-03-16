import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center whitespace-nowrap border border-transparent [font-family:'JetBrains_Mono',ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation_Mono','Courier_New',monospace] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      primary:
        "border-transparent bg-[#10B981] px-6 py-2.5 text-[13px] font-medium text-[#0A0A0A] hover:bg-emerald-400",
      secondary:
        "border-[#2A2A2A] bg-transparent px-4 py-2 text-xs font-normal text-[#FAFAFA] hover:bg-zinc-900",
      link: "border-[#2A2A2A] bg-transparent px-3 py-1.5 text-xs font-normal text-[#6B7280] hover:text-[#9CA3AF]",
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
        className={twMerge(buttonVariants({ variant, size }), className)}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
