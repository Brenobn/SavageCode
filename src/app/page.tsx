import { Suspense } from "react";
import { HomePageClient } from "@/components/home/home-page-client";
import { HomepageLeaderboard } from "@/components/home/homepage-leaderboard";
import { HomepageLeaderboardSkeleton } from "@/components/home/homepage-leaderboard-skeleton";
import { HomepageMetrics } from "@/components/home/homepage-metrics";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <HomePageClient
      leaderboardSlot={
        <Suspense fallback={<HomepageLeaderboardSkeleton />}>
          <HomepageLeaderboard />
        </Suspense>
      }
      metricsSlot={<HomepageMetrics />}
    />
  );
}
