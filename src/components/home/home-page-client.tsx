"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CodeEditor,
  ToggleControl,
  ToggleLabel,
  ToggleRoot,
  ToggleThumb,
} from "@/components/ui";
import { detectLanguage } from "@/lib/code-language-detect";
import {
  getLanguageById,
  type SupportedLanguageId,
} from "@/lib/code-languages";
import { TRPCReactProvider, useTRPC } from "@/trpc/client";

const codeSample = [
  "function calculateTotal(items) {",
  "  const subtotal = items.reduce((sum, item) => sum + item.price, 0);",
  "",
  "  let discount = 0;",
  "  if (subtotal > 100) {",
  "    discount = subtotal * 0.1;",
  "  }",
  "",
  "  const final = subtotal - discount;",
  "  return Number(final.toFixed(2));",
  "}",
].join("\n");

const CODE_SNIPPET_CHAR_LIMIT = 2000;

type RoastLanguage =
  | "javascript"
  | "typescript"
  | "sql"
  | "java"
  | "python"
  | "bash"
  | "go"
  | "rust"
  | "csharp"
  | "cpp"
  | "php"
  | "ruby"
  | "unknown";

export function toRoastLanguage(language: SupportedLanguageId): RoastLanguage {
  switch (language) {
    case "javascript":
    case "typescript":
    case "sql":
    case "java":
    case "python":
    case "bash":
    case "go":
    case "rust":
    case "csharp":
    case "cpp":
    case "php":
    case "ruby":
      return language;
    default:
      return "unknown";
  }
}

export function getSubmitButtonLabel(isSubmitting: boolean) {
  return isSubmitting ? "$ roasting..." : "$ roast_my_code";
}

interface HomePageClientProps {
  leaderboardSlot: React.ReactNode;
  metricsSlot: React.ReactNode;
}

function HomePageClientContent({
  leaderboardSlot,
  metricsSlot,
}: HomePageClientProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [code, setCode] = useState(codeSample);
  const [roastModeEnabled, setRoastModeEnabled] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguageId>(
    detectLanguage(codeSample).language,
  );
  const hasCode = useMemo(() => code.trim().length > 0, [code]);
  const isOverCodeLimit = code.length > CODE_SNIPPET_CHAR_LIMIT;

  const languageIndicator = `detected: ${getLanguageById(detectedLanguage)?.label ?? "Plaintext"}`;

  const roastMutation = useMutation(
    trpc.roast.createAndAnalyze.mutationOptions({
      onMutate: () => {
        setSubmitError(null);
      },
      onSuccess: ({ roastId }) => {
        router.push(`/result/${roastId}`);
      },
      onError: (error) => {
        setSubmitError(
          error.message || "Failed to analyze code. Please try again.",
        );
      },
    }),
  );

  const handleSubmit = () => {
    if (!hasCode || isOverCodeLimit || roastMutation.isPending) {
      return;
    }

    roastMutation.mutate({
      code,
      language: toRoastLanguage(detectedLanguage),
      roastMode: roastModeEnabled ? "maximum" : "normal",
    });
  };

  useEffect(() => {
    if (code.trim().length === 0) {
      setDetectedLanguage("plaintext");
      return;
    }

    const timeoutId = setTimeout(() => {
      const nextLanguage = detectLanguage(code);

      setDetectedLanguage(nextLanguage.language);
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [code]);

  return (
    <main className="bg-bg-page text-text-primary">
      <div className="mx-auto w-full max-w-6xl px-10 pt-20 pb-0">
        <section className="mx-auto flex w-full max-w-[780px] flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
              <span className="text-accent-green">$</span>
              <span>paste your code. get roasted.</span>
            </h1>
            <p className="font-mono text-sm text-text-secondary">
              {
                "// drop your code below and we'll rate it - brutally honest or full roast mode"
              }
            </p>
          </div>

          <CodeEditor
            language={detectedLanguage}
            languageIndicator={languageIndicator}
            maxCharacterCount={CODE_SNIPPET_CHAR_LIMIT}
            onValueChange={setCode}
            value={code}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <ToggleRoot
                checked={roastModeEnabled}
                onCheckedChange={setRoastModeEnabled}
              >
                <ToggleControl>
                  <ToggleThumb />
                </ToggleControl>
                <ToggleLabel>roast mode</ToggleLabel>
              </ToggleRoot>
              <span className="font-mono text-xs text-text-tertiary">
                {isOverCodeLimit
                  ? `// max ${CODE_SNIPPET_CHAR_LIMIT.toLocaleString()} chars exceeded`
                  : roastModeEnabled
                    ? "// maximum sarcasm enabled"
                    : "// balanced critique enabled"}
              </span>
            </div>

            <Button
              disabled={!hasCode || isOverCodeLimit || roastMutation.isPending}
              onClick={handleSubmit}
              variant="primary"
            >
              {getSubmitButtonLabel(roastMutation.isPending)}
            </Button>
          </div>

          {submitError ? (
            <p className="font-mono text-xs text-accent-red" role="alert">
              {submitError}
            </p>
          ) : null}

          {metricsSlot}
        </section>

        {leaderboardSlot}
      </div>
    </main>
  );
}

export function HomePageClient(props: HomePageClientProps) {
  return (
    <TRPCReactProvider>
      <HomePageClientContent {...props} />
    </TRPCReactProvider>
  );
}
