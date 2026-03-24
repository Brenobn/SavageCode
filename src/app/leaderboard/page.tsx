import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import { leaderboardEntries, leaderboardStats } from "@/lib/leaderboard-static";

export const metadata: Metadata = {
  title: "Leaderboard | DevRoast",
  description: "Leaderboard estatico dos codigos mais roastados no DevRoast.",
};

export const dynamic = "force-dynamic";

function toShikiLanguage(language: string): string {
  switch (language) {
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
      return language;
    default:
      return "plaintext";
  }
}

function toCodeSnippet(entry: (typeof leaderboardEntries)[number]): string {
  return entry.codeLines
    .map((line) => line.tokens.map((token) => token.content).join(""))
    .join("\n");
}

export default function LeaderboardPage() {
  const featuredEntries = leaderboardEntries.slice(0, 5);

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
              {leaderboardStats.totalRoasts.toLocaleString()} submissions
            </span>
            <span>&middot;</span>
            <span>avg score: {leaderboardStats.averageScore}</span>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5">
          {featuredEntries.map((entry) => (
            <article
              key={entry.rank}
              className="w-full border border-border-primary"
            >
              <header className="flex h-12 items-center justify-between border-b border-border-primary px-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-mono text-[13px] leading-none">
                    <span className="text-text-tertiary">#</span>
                    <span className="font-bold text-accent-amber">
                      {entry.rank.replace("#", "")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs leading-none">
                    <span className="text-text-tertiary">score:</span>
                    <span className="text-[13px] font-bold text-accent-red">
                      {entry.score}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-text-secondary">{entry.language}</span>
                  <span className="text-text-tertiary">
                    {entry.lineCount} lines
                  </span>
                </div>
              </header>

              <CodeBlock
                className="h-30 border-0"
                code={toCodeSnippet(entry)}
                lang={toShikiLanguage(entry.language)}
              />
            </article>
          ))}
        </section>

        <div className="flex items-center justify-between font-mono text-xs text-text-tertiary">
          <span>showing top {featuredEntries.length}</span>
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
