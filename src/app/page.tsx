import { HomePageClient } from "@/components/home/home-page-client";
import { HomepageMetrics } from "@/components/home/homepage-metrics";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <HomePageClient>
      <HomepageMetrics />
    </HomePageClient>
  );
}
