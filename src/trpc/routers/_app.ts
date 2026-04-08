import { createTRPCRouter } from "@/trpc/init";
import { leaderboardRouter } from "./leaderboard";
import { metricsRouter } from "./metrics";
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  metrics: metricsRouter,
  roast: roastRouter,
});

export type AppRouter = typeof appRouter;
