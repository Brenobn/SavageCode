import { cacheLife } from "next/cache";
import Link from "next/link";
import { HomepageLeaderboardRow } from "@/components/home/homepage-leaderboard-row";
import {
  SectionTitleRoot,
  SectionTitleSlash,
  SectionTitleText,
} from "@/components/ui";
import { CodeBlock } from "@/components/ui/code-block";
import {
  getLeaderboardStats,
  listHomepageLeaderboardTop,
} from "@/db/queries/roasts";

type ScoreTone = "critical" | "warning" | "good" | "muted";

function getScoreTone(score: number): ScoreTone {
  if (score <= 2) {
    return "critical";
  }

  if (score <= 3.8) {
    return "warning";
  }

  if (score <= 5) {
    return "muted";
  }

  return "good";
}

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

export async function HomepageLeaderboard() {
  "use cache";
  cacheLife("hours");

  const [rows, stats] = await Promise.all([
    listHomepageLeaderboardTop(),
    getLeaderboardStats(),
  ]);

  const entries = rows.map((row, index) => {
    const scoreNumber = Number(row.score ?? 0);
    const normalizedLines = row.code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const firstLine = normalizedLines[0] ?? row.code.trim();
    const codePreview =
      firstLine.length > 120
        ? `${firstLine.slice(0, 117)}...`
        : firstLine || "(empty code)";

    return {
      code: row.code,
      codePreview,
      language: row.language,
      rank: `#${index + 1}`,
      score: scoreNumber,
      scoreTone: getScoreTone(scoreNumber),
    };
  });

  return (
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

      <div className="flex flex-col gap-5">
        {entries.map((row) => (
          <article className="border border-border-primary" key={row.rank}>
            <HomepageLeaderboardRow
              collapsedCodeBlock={
                <CodeBlock
                  className="border-0"
                  code={row.code.split("\n").slice(0, 3).join("\n")}
                  lang={toShikiLanguage(row.language)}
                  wrapLongLines
                />
              }
              codePreview={row.codePreview}
              expandedCodeBlock={
                <CodeBlock
                  className="border-0"
                  code={row.code}
                  lang={toShikiLanguage(row.language)}
                  wrapLongLines
                />
              }
              hasMoreLines={row.code.split("\n").length > 3}
              language={row.language}
              rank={row.rank}
              score={row.score}
              scoreTone={row.scoreTone}
            />
          </article>
        ))}
      </div>

      <div className="flex justify-center gap-1 py-4 font-sans text-xs text-text-tertiary">
        <span>
          showing top 3 of {stats.totalSubmissions.toLocaleString()} -
        </span>
        <Link
          className="text-text-secondary underline-offset-4 hover:underline"
          href="/leaderboard"
        >
          view full leaderboard &gt;&gt;
        </Link>
      </div>
    </section>
  );
}
