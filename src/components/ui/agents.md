# UI Component Standards

This folder contains reusable visual components shared across pages.

## Core rules

1. Use TypeScript and named exports only. Never use default exports for UI components.
2. Extend native HTML props in component props types whenever possible.
3. Use `tailwind-variants` (`tv`) for variants and sizes.
4. When using `tv`, pass `className` directly to the variant function instead of `twMerge`.
5. Use design tokens from `src/app/globals.css` (`var(--...)`) for colors, borders, spacing, and fonts.
6. Prefer `forwardRef` for interactive primitives like button, input, textarea, select, and links rendered as buttons.
7. Keep base styles in the component file and expose `...Variants` for composition.
8. Re-export all UI components from `src/components/ui/index.ts`.

## Recommended component shape

```tsx
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const componentVariants = tv({
  base: "",
  variants: {
    variant: {
      primary: "",
      secondary: "",
    },
    size: {
      sm: "",
      md: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ComponentProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof componentVariants> {}

export const Component = forwardRef<HTMLButtonElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={componentVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  },
);

Component.displayName = "Component";

export { componentVariants };
```
