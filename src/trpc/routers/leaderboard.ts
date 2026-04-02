// biome-ignore assist/source/organizeImports: just don´t mind
import {
  getLeaderboardStats,
  listHomepageLeaderboardTop,
  listLeaderboard,
} from "@/db/queries/roasts";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { unstable_cache } from "next/cache";

type ScoreTone = "critical" | "warning" | "good" | "muted";

type FullLeaderboardResponse = {
  entries: Array<{
    rank: string;
    score: number;
    scoreTone: ScoreTone;
    language: string;
    lineCount: number;
    codePreview: string;
    code: string;
  }>;
  stats: {
    totalSubmissions: number;
    averageScore: number;
  };
};

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
    const rows = await listHomepageLeaderboardTop();

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
  full: publicProcedure.query(async (): Promise<FullLeaderboardResponse> => {
    const [rows, stats] = await Promise.all([
      listLeaderboard(20, 0),
      getLeaderboardStats(),
    ]);

    const entries = rows.map((row, index) => {
      const scoreNumber = Number(row.score ?? 0);

      return {
        rank: `#${index + 1}`,
        score: scoreNumber,
        scoreTone: getScoreTone(scoreNumber),
        language: row.language,
        lineCount: row.lineCount,
        codePreview: row.codePreview,
        code: row.code,
      };
    });

    return {
      entries,
      stats,
    };
  }),
});
