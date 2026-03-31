import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { roastResults } from "@/db/schema/roast-results";
import { submissions } from "@/db/schema/submissions";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const metricsRouter = createTRPCRouter({
  homepage: publicProcedure.query(async () => {
    const [metrics] = await db
      .select({
        totalRoasts: sql<number>`count(*)::int`,
        averageScore: sql<number>`coalesce(round(avg(${roastResults.score})::numeric, 1), 0)::float8`,
      })
      .from(roastResults)
      .innerJoin(submissions, eq(roastResults.submissionId, submissions.id))
      .where(
        and(
          eq(roastResults.status, "completed"),
          eq(submissions.visibility, "public"),
        ),
      );

    return {
      totalRoasts: metrics?.totalRoasts ?? 0,
      averageScore: metrics?.averageScore ?? 0,
    };
  }),
});
