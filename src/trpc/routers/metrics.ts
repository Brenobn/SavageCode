import { cacheLife } from "next/cache";
import { getLeaderboardStats } from "@/db/queries/roasts";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

async function getHomepageMetricsCached() {
  "use cache";
  cacheLife("hours");

  const stats = await getLeaderboardStats();

  return {
    totalRoasts: stats.totalSubmissions,
    averageScore: stats.averageScore,
  };
}

export const metricsRouter = createTRPCRouter({
  homepage: publicProcedure.query(async () => getHomepageMetricsCached()),
});
