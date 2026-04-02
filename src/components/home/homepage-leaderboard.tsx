import Link from "next/link";
import { HomepageLeaderboardRow } from "@/components/home/homepage-leaderboard-row";
import {
  SectionTitleRoot,
  SectionTitleSlash,
  SectionTitleText,
} from "@/components/ui";
import { CodeBlock } from "@/components/ui/code-block";
import { getQueryClient, trpc } from "@/trpc/server";

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
  const queryClient = getQueryClient();

  const [entries, metrics] = await Promise.all([
    queryClient.fetchQuery(trpc.leaderboard.homepageTop.queryOptions()),
    queryClient.fetchQuery(trpc.metrics.homepage.queryOptions()),
  ]);

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
        <span>showing top 3 of {metrics.totalRoasts.toLocaleString()} -</span>
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
