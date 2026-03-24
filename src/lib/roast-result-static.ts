export interface RoastIssue {
  description: string;
  label: string;
  title: string;
  tone: "critical" | "warning" | "good";
}

export interface RoastDiffLine {
  code: string;
  variant: "added" | "removed" | "context";
}

export interface RoastResultStatic {
  diffFileLabel: string;
  diffLines: RoastDiffLine[];
  issues: RoastIssue[];
  languageLabel: string;
  quote: string;
  score: number;
  submittedCode: string;
  submittedLineLabel: string;
  verdictLabel: string;
}

const submittedCode = [
  "function calculateTotal(items) {",
  "  var total = 0;",
  "  for (var i = 0; i < items.length; i++) {",
  "    total = total + items[i].price;",
  "  }",
  "",
  "  if (total > 100) {",
  '    console.log("discount applied");',
  "    total = total * 0.9;",
  "  }",
  "",
  "  // TODO: handle tax calculation",
  "  // TODO: handle currency conversion",
  "",
  "  return total;",
  "}",
].join("\n");

export const roastResultStatic: RoastResultStatic = {
  diffFileLabel: "your_code.ts -> improved_code.ts",
  diffLines: [
    {
      code: "function calculateTotal(items) {",
      variant: "context",
    },
    {
      code: "  var total = 0;",
      variant: "removed",
    },
    {
      code: "  for (var i = 0; i < items.length; i++) {",
      variant: "removed",
    },
    {
      code: "    total = total + items[i].price;",
      variant: "removed",
    },
    {
      code: "  }",
      variant: "removed",
    },
    {
      code: "  return total;",
      variant: "removed",
    },
    {
      code: "  return items.reduce((sum, item) => sum + item.price, 0);",
      variant: "added",
    },
    {
      code: "}",
      variant: "context",
    },
  ],
  issues: [
    {
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
      label: "critical",
      title: "using var instead of const/let",
      tone: "critical",
    },
    {
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
      label: "warning",
      title: "imperative loop pattern",
      tone: "warning",
    },
    {
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
      label: "good",
      title: "clear naming conventions",
      tone: "good",
    },
    {
      description:
        "the function does one thing well - calculates a total. no side effects, no mixed concerns, no hidden complexity.",
      label: "good",
      title: "single responsibility",
      tone: "good",
    },
  ],
  languageLabel: "javascript",
  quote:
    '"this code looks like it was written during a power outage... in 2005."',
  score: 3.5,
  submittedCode,
  submittedLineLabel: "7 lines",
  verdictLabel: "verdict: needs_serious_help",
};
