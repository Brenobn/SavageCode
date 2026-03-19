import { and, eq, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { roastResults } from "./roast-results";
import { submissions } from "./submissions";

export const leaderboardEntries = pgView("leaderboard_entries").as((qb) =>
  qb
    .select({
      submissionId: sql<string>`${submissions.id}`.as("submission_id"),
      roastResultId: sql<string>`${roastResults.id}`.as("roast_result_id"),
      score: sql<string | null>`${roastResults.score}`.as("score"),
      language: sql<string>`${submissions.language}`.as("language"),
      lineCount: sql<number>`${submissions.lineCount}`.as("line_count"),
      codePreview:
        sql<string>`substring(${submissions.code} from 1 for 120)`.as(
          "code_preview",
        ),
      createdAt: sql<Date>`${roastResults.createdAt}`.as("created_at"),
    })
    .from(roastResults)
    .innerJoin(submissions, eq(roastResults.submissionId, submissions.id))
    .where(
      and(
        eq(roastResults.status, "completed"),
        eq(submissions.visibility, "public"),
      ),
    ),
);
