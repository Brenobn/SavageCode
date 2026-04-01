import Link from "next/link";
import {
  SectionTitleRoot,
  SectionTitleSlash,
  SectionTitleText,
  TableRowCode,
  TableRowLanguage,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui";
import { getQueryClient, trpc } from "@/trpc/server";

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
          <TableRowRoot key={row.rank} scoreTone={row.scoreTone}>
            <TableRowRank>{row.rank}</TableRowRank>

            <div className="w-15">
              <TableRowScore scoreTone={row.scoreTone}>
                {row.score.toFixed(1)}
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
