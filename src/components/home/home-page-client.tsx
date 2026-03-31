"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CodeEditor,
  SectionTitleRoot,
  SectionTitleSlash,
  SectionTitleText,
  TableRowCode,
  TableRowLanguage,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
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
import { leaderboardEntries, leaderboardStats } from "@/lib/leaderboard-static";

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
  children: React.ReactNode;
}

export function HomePageClient({ children }: HomePageClientProps) {
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

          {children}
        </section>

        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-16">
          <div className="flex items-center justify-between">
            <SectionTitleRoot>
              <SectionTitleSlash />
              <SectionTitleText>shame_leaderboard</SectionTitleText>
            </SectionTitleRoot>
            <Link
              className="font-mono text-xs text-text-secondary underline-offset-4 hover:underline"
              href="/leaderboard"
            >
              $ view_all &gt;&gt;
            </Link>
          </div>

          <p className="font-sans text-[13px] text-text-tertiary">
            {"// the worst code on the internet, ranked by shame"}
          </p>

          <div className="border border-border-primary">
            <div className="flex h-10 items-center border-b border-border-primary bg-bg-surface px-5 font-mono text-xs text-text-tertiary">
              <div className="w-12.5">rank</div>
              <div className="w-17.5">score</div>
              <div className="flex-1">code</div>
              <div className="w-25">lang</div>
            </div>

            {leaderboardEntries.slice(0, 3).map((row) => (
              <TableRowRoot key={row.rank} scoreTone={row.scoreTone}>
                <TableRowRank>{row.rank}</TableRowRank>

                <div className="w-15">
                  <TableRowScore scoreTone={row.scoreTone}>
                    {row.score}
                  </TableRowScore>
                </div>

                <TableRowCode>
                  <p className="truncate">{row.codePreview}</p>
                </TableRowCode>

                <TableRowLanguage>{row.language}</TableRowLanguage>
              </TableRowRoot>
            ))}
          </div>

          <div className="flex justify-center gap-1 py-4 font-sans text-xs text-text-tertiary">
            <span>
              showing top 3 of {leaderboardStats.totalRoasts.toLocaleString()} -
            </span>
            <Link
              className="text-text-secondary underline-offset-4 hover:underline"
              href="/leaderboard"
            >
              view full leaderboard &gt;&gt;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
