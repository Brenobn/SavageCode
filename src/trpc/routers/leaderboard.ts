// biome-ignore assist/source/organizeImports: just don´t mind
import {
  getLeaderboardStats,
  listHomepageLeaderboardTop,
  listLeaderboard,
} from "@/db/queries/roasts";
import { cacheLife } from "next/cache";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

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

async function getHomepageTopCached() {
  "use cache";
  cacheLife("hours");

  return listHomepageLeaderboardTop();
}

async function getFullLeaderboardCached() {
  "use cache";
  cacheLife("hours");

  const [rows, stats] = await Promise.all([
    listLeaderboard(20, 0),
    getLeaderboardStats(),
  ]);

  return { rows, stats };
}

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
  full: publicProcedure.query(async (): Promise<FullLeaderboardResponse> => {
    const { rows, stats } = await getFullLeaderboardCached();

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
