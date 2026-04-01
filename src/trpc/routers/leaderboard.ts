import { listLeaderboard } from "@/db/queries/roasts";
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

export const leaderboardRouter = createTRPCRouter({
  homepageTop: publicProcedure.query(async () => {
    const rows = await listLeaderboard(3, 0);

    return rows.map((row, index) => {
      const scoreNumber = Number(row.score ?? 0);

      return {
        codePreview: row.codePreview,
        language: row.language,
        rank: `#${index + 1}`,
        score: scoreNumber,
        scoreTone: getScoreTone(scoreNumber),
      };
    });
  }),
});
