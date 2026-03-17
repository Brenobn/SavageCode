import { tv, type VariantProps } from "tailwind-variants";

const scoreRingVariants = tv({
  base: "relative grid place-items-center rounded-full",
  variants: {
    size: {
      md: "size-35",
      lg: "size-45",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export interface ScoreRingProps extends VariantProps<typeof scoreRingVariants> {
  max?: number;
  value: number;
}

function getToneColor(value: number) {
  if (value <= 3.5) {
    return "stroke-accent-red";
  }

  if (value <= 7) {
    return "stroke-accent-amber";
  }

  return "stroke-accent-green";
}

export function ScoreRing({ max = 10, size, value }: ScoreRingProps) {
  const clampedValue = Math.max(0, Math.min(value, max));
  const progress = clampedValue / max;
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className={scoreRingVariants({ size })}>
      <svg
        className="absolute inset-0 size-full -rotate-90"
        role="img"
        viewBox="0 0 200 200"
      >
        <title>Score ring</title>
        <circle
          className="stroke-border-primary"
          cx="100"
          cy="100"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle
          className={getToneColor(clampedValue)}
          cx="100"
          cy="100"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>

      <div className="relative flex items-end gap-1 font-mono">
        <span className="text-5xl leading-none font-bold text-text-primary">
          {clampedValue.toFixed(1)}
        </span>
        <span className="mb-1 text-base text-text-tertiary">/{max}</span>
      </div>
    </div>
  );
}

export { scoreRingVariants };
