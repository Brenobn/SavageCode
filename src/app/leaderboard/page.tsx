import type { Metadata } from "next";
import Link from "next/link";
import { HomepageLeaderboardRow } from "@/components/home/homepage-leaderboard-row";
import { CodeBlock } from "@/components/ui/code-block";
import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Leaderboard | DevRoast",
  description: "Leaderboard estatico dos codigos mais roastados no DevRoast.",
};

export const dynamic = "force-dynamic";

type LeaderboardEntry = {
  rank: string;
  score: number;
  scoreTone: "critical" | "warning" | "good" | "muted";
  language: string;
  lineCount: number;
  codePreview: string;
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
            <span>avg score: {data.stats.averageScore.toFixed(1)}</span>
          </div>
        </section>

        <section className="flex w-full flex-col">
          <div className="border border-border-primary">
            <div className="flex h-10 items-center border-b border-border-primary bg-bg-surface px-5 font-mono text-xs text-text-tertiary">
              <div className="w-12.5">rank</div>
              <div className="w-17.5">score</div>
              <div className="flex-1">code</div>
              <div className="w-25">lang</div>
            </div>

            {entries.length > 0 ? (
              entries.map((entry: LeaderboardEntry) => {
                const language = toShikiLanguage(entry.language);

                return (
                  <HomepageLeaderboardRow
                    collapsedCodeBlock={
                      <CodeBlock
                        className="h-30 border-0"
                        code={getCollapsedCode(entry.code)}
                        lang={language}
                      />
                    }
                    codePreview={entry.codePreview}
                    expandedCodeBlock={
                      <CodeBlock
                        className="max-h-[480px] border-0"
                        code={entry.code}
                        lang={language}
                      />
                    }
                    key={entry.rank}
                    language={entry.language}
                    rank={entry.rank}
                    score={entry.score}
                    scoreTone={entry.scoreTone}
                  />
                );
              })
            ) : (
              <div className="px-5 py-6 font-mono text-xs text-text-tertiary">
                no public completed submissions yet - submit code to start the
                leaderboard.
              </div>
            )}
          </div>
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
