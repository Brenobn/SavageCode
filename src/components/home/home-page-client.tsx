"use client";

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

interface HomePageClientProps {
  leaderboardSlot: React.ReactNode;
  metricsSlot: React.ReactNode;
}

export function HomePageClient({
  leaderboardSlot,
  metricsSlot,
}: HomePageClientProps) {
  const [code, setCode] = useState(codeSample);
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguageId>(
    detectLanguage(codeSample).language,
  );
  const hasCode = useMemo(() => code.trim().length > 0, [code]);
  const isOverCodeLimit = code.length > CODE_SNIPPET_CHAR_LIMIT;

  const languageIndicator = `detected: ${getLanguageById(detectedLanguage)?.label ?? "Plaintext"}`;

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
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
              <span className="text-accent-green">$</span>
              <span>paste your code. get roasted.</span>
            </h1>
            <p className="font-sans text-sm text-text-secondary">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ToggleRoot defaultChecked>
                <ToggleControl>
                  <ToggleThumb />
                </ToggleControl>
                <ToggleLabel>roast mode</ToggleLabel>
              </ToggleRoot>
              <span className="font-sans text-xs text-text-tertiary">
                {isOverCodeLimit
                  ? `// max ${CODE_SNIPPET_CHAR_LIMIT.toLocaleString()} chars exceeded`
                  : "// maximum sarcasm enabled"}
              </span>
            </div>

            <Button disabled={!hasCode || isOverCodeLimit} variant="primary">
              $ roast_my_code
            </Button>
          </div>

          {metricsSlot}
        </section>

        {leaderboardSlot}
      </div>
    </main>
  );
}
