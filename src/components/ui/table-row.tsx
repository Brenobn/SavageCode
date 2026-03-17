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

export interface TableRowProps extends VariantProps<typeof tableRowVariants> {
  codePreview: string;
  language: string;
  rank: string;
  score: string;
}

export function TableRow({
  codePreview,
  language,
  rank,
  score,
  scoreTone,
}: TableRowProps) {
  return (
    <div className={tableRowVariants({ scoreTone })}>
      <div className="w-10 text-[13px] text-text-tertiary">{rank}</div>

      <div className="w-15">
        <span className={scoreTextVariants({ scoreTone })}>{score}</span>
      </div>

      <div className="min-w-0 flex-1 text-xs text-text-secondary">
        <p className="truncate">{codePreview}</p>
      </div>

      <div className="w-25 text-xs text-text-tertiary">{language}</div>
    </div>
  );
}

export { tableRowVariants };
