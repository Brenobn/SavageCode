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

      <div className="border border-border-primary">
        <div className="flex h-10 items-center border-b border-border-primary bg-bg-surface px-5 font-mono text-xs text-text-tertiary">
          <div className="w-12.5">rank</div>
          <div className="w-17.5">score</div>
          <div className="flex-1">code</div>
          <div className="w-25">lang</div>
        </div>

        {entries.map((row) => (
          <HomepageLeaderboardRow
            collapsedCodeBlock={
              <CodeBlock
                className="border-0"
                code={row.code.split("\n").slice(0, 3).join("\n")}
                lang={toShikiLanguage(row.language)}
              />
            }
            codePreview={row.codePreview}
            expandedCodeBlock={
              <CodeBlock
                className="border-0"
                code={row.code}
                lang={toShikiLanguage(row.language)}
              />
            }
            key={row.rank}
            language={row.language}
            rank={row.rank}
            score={row.score}
            scoreTone={row.scoreTone}
          />
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
