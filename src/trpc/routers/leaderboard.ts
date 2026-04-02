import { unstable_cache } from "next/cache";
import { listHomepageLeaderboardTop } from "@/db/queries/roasts";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

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

const getHomepageTopCached = unstable_cache(
  async () => listHomepageLeaderboardTop(3),
  ["leaderboard-homepage-top"],
  {
    revalidate: 3600,
    tags: ["leaderboard", "leaderboard-homepage-top"],
  },
);

export const leaderboardRouter = createTRPCRouter({
  homepageTop: publicProcedure.query(async () => {
    const rows = await getHomepageTopCached();

    return rows.map((row, index) => {
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
  }),
});
