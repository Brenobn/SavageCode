import type { Metadata } from "next";
import Link from "next/link";
import { ExpandableCodeBlock } from "@/components/home/expandable-code-block";
import { CodeBlock } from "@/components/ui/code-block";
import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Leaderboard | DevRoast",
  description: "Leaderboard estatico dos codigos mais roastados no DevRoast.",
};

export const revalidate = 3600;

type LeaderboardEntry = {
  rank: string;
  score: number;
  scoreTone: "critical" | "warning" | "good" | "muted";
  language: string;
  lineCount: number;
  code: string;
};

const languageAliases: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  yml: "yaml",
  md: "markdown",
};

function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();
  return languageAliases[normalized] ?? normalized;
}

function toShikiLanguage(language: string): string {
  const normalizedLanguage = normalizeLanguage(language);

  switch (normalizedLanguage) {
    case "javascript":
    case "typescript":
    case "sql":
    case "java":
    case "python":
    case "go":
    case "php":
    case "ruby":
    case "rust":
    case "yaml":
    case "markdown":
    case "dockerfile":
    case "bash":
    case "css":
    case "html":
    case "json":
      return normalizedLanguage;
    default:
      return "plaintext";
  }
}

function getCollapsedCode(code: string): string {
  return code.split("\n").slice(0, 3).join("\n");
}

function getScoreToneClass(scoreTone: LeaderboardEntry["scoreTone"]): string {
  switch (scoreTone) {
    case "critical":
      return "text-accent-red";
    case "warning":
      return "text-accent-amber";
    case "good":
      return "text-accent-green";
    default:
      return "text-text-secondary";
  }
}

function getLineCountLabel(lineCount: number): string {
  return lineCount === 1 ? "1 line" : `${lineCount} lines`;
}

export default async function LeaderboardPage() {
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.leaderboard.full.queryOptions(),
  );
  const entries = data.entries;

  return (
    <main className="bg-bg-page text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-10 py-10 md:px-20">
        <section className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[2rem] leading-none font-bold text-accent-green">
              &gt;
            </span>
            <h1 className="font-mono text-[28px] leading-none font-bold text-text-primary">
              shame_leaderboard
            </h1>
          </div>

          <p className="font-mono text-sm text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>

          <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
            <span>
              {data.stats.totalSubmissions.toLocaleString()} submissions
            </span>
            <span>&middot;</span>
            <span>avg score: {data.stats.averageScore.toFixed(1)}/10</span>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5">
          {entries.length > 0 ? (
            entries.map((entry: LeaderboardEntry) => {
              const language = toShikiLanguage(entry.language);
              const hasMoreLines = entry.code.split("\n").length > 3;

              return (
                <article
                  className="border border-border-primary"
                  key={entry.rank}
                >
                  <div className="flex h-10 items-center justify-between border-b border-border-primary bg-bg-surface px-4 font-mono text-xs">
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <span>#{entry.rank}</span>
                      <span>score:</span>
                      <span className={getScoreToneClass(entry.scoreTone)}>
                        {entry.score.toFixed(1)}
                      </span>
                    </div>

                    <div className="text-text-tertiary">
                      {entry.language} {getLineCountLabel(entry.lineCount)}
                    </div>
                  </div>

                  <ExpandableCodeBlock
                    collapsedContent={
                      <CodeBlock
                        className="border-0"
                        code={getCollapsedCode(entry.code)}
                        lang={language}
                        wrapLongLines
                      />
                    }
                    expandedContent={
                      <CodeBlock
                        className="border-0"
                        code={entry.code}
                        lang={language}
                        wrapLongLines
                      />
                    }
                    hasMoreLines={hasMoreLines}
                  />
                </article>
              );
            })
          ) : (
            <div className="border border-border-primary px-5 py-6 font-mono text-xs text-text-tertiary">
              no public completed submissions yet - submit code to start the
              leaderboard.
            </div>
          )}
        </section>

        <div className="flex items-center justify-between font-mono text-xs text-text-tertiary">
          <span>showing top {entries.length}</span>
          <Link
            className="text-text-secondary underline-offset-4 hover:underline"
            href="/"
          >
            &lt;&lt; back to roast input
          </Link>
        </div>
      </div>
    </main>
  );
}
