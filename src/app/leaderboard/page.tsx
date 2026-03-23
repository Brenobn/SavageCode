import type { Metadata } from "next";
import Link from "next/link";
import {
  type LeaderboardTokenTone,
  leaderboardEntries,
  leaderboardStats,
} from "@/lib/leaderboard-static";

export const metadata: Metadata = {
  title: "Leaderboard | DevRoast",
  description: "Leaderboard estatico dos codigos mais roastados no DevRoast.",
};

export const dynamic = "force-dynamic";

const tokenToneClasses: Record<LeaderboardTokenTone, string> = {
  keyword: "text-accent-amber",
  function: "text-accent-blue",
  operator: "text-text-secondary",
  string: "text-accent-cyan",
  variable: "text-accent-red",
  number: "text-accent-orange",
  comment: "text-text-tertiary",
};

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

              <div className="flex h-[120px] overflow-hidden border-border-primary bg-bg-input">
                <div className="flex w-10 flex-col items-end gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-3.5 font-mono text-xs text-text-tertiary">
                  {entry.codeLines.map((_, lineIndex) => (
                    <span key={`${entry.rank}-line-${lineIndex + 1}`}>
                      {lineIndex + 1}
                    </span>
                  ))}
                </div>

                <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5 font-mono text-xs">
                  {entry.codeLines.map((line, lineIndex) => (
                    <p key={`${entry.rank}-content-${lineIndex + 1}`}>
                      {line.tokens.map((token, tokenIndex) => (
                        <span
                          className={tokenToneClasses[token.tone]}
                          key={`${entry.rank}-token-${lineIndex + 1}-${tokenIndex + 1}`}
                        >
                          {token.content}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
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
