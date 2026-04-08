type PersistedRoastVerdict =
  | "needs_serious_help"
  | "needs_work"
  | "decent"
  | "clean"
  | null;

type PersistedRoastFindingTone = "critical" | "warning" | "good" | "muted";

type PersistedRoastDiffLineType = "context" | "removed" | "added";

export interface RoastResultViewModelInput {
  code: string;
  diffLines: Array<{
    content: string;
    lineType: PersistedRoastDiffLineType;
    position: number;
  }>;
  findings: Array<{
    description: string;
    id: string;
    position: number;
    title: string;
    tone: PersistedRoastFindingTone;
  }>;
  language: string;
  lineCount: number;
  roastQuote: string | null;
  score: number | string | null;
  verdict: PersistedRoastVerdict;
}

export interface RoastResultViewModel {
  diffFileLabel: string;
  diffLines: Array<{
    code: string;
    variant: PersistedRoastDiffLineType;
  }>;
  issues: Array<{
    description: string;
    id: string;
    label: PersistedRoastFindingTone;
    title: string;
    tone: "critical" | "warning" | "good";
  }>;
  languageLabel: string;
  quote: string;
  score: number;
  submittedCode: string;
  submittedLineLabel: string;
  verdictLabel: string;
  verdictTone: VerdictTone;
}

type VerdictTone = "critical" | "warning" | "good";

function toVerdictTone(verdict: PersistedRoastVerdict): VerdictTone {
  switch (verdict) {
    case "needs_serious_help":
      return "critical";
    case "needs_work":
      return "warning";
    case "decent":
    case "clean":
      return "good";
    default:
      return "warning";
  }
}

export function toRoastResultViewModel(
  data: RoastResultViewModelInput,
): RoastResultViewModel {
  const score = Number(data.score ?? 0);
  const safeScore = Number.isFinite(score) ? score : 0;
  const verdict = data.verdict ?? "needs_work";

  return {
    diffFileLabel: "your_code -> suggested_fix",
    diffLines: data.diffLines.map((line) => ({
      code: line.content,
      variant: line.lineType,
    })),
    issues: data.findings.map((finding) => ({
      description: finding.description,
      id: finding.id,
      label: finding.tone,
      title: finding.title,
      tone: finding.tone === "muted" ? "warning" : finding.tone,
    })),
    languageLabel: data.language,
    quote: data.roastQuote ?? "analysis unavailable",
    score: safeScore,
    submittedCode: data.code,
    submittedLineLabel: `${data.lineCount} ${data.lineCount === 1 ? "line" : "lines"}`,
    verdictLabel: `verdict: ${verdict}`,
    verdictTone: toVerdictTone(data.verdict),
  };
}
