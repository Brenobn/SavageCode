import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { analysisFindings } from "@/db/schema/analysis-findings";
import { leaderboardEntries } from "@/db/schema/leaderboard-entries";
import { roastResults } from "@/db/schema/roast-results";
import { submissions } from "@/db/schema/submissions";
import { suggestedDiffLines } from "@/db/schema/suggested-diff-lines";

type SubmissionInsert = typeof submissions.$inferInsert;
type RoastResultInsert = typeof roastResults.$inferInsert;
type AnalysisFindingInsert = typeof analysisFindings.$inferInsert;
type SuggestedDiffLineInsert = typeof suggestedDiffLines.$inferInsert;

interface CreateSubmissionInput {
  code: string;
  language: SubmissionInsert["language"];
  lineCount: number;
  roastMode: SubmissionInsert["roastMode"];
  visibility?: SubmissionInsert["visibility"];
  fingerprint?: string | null;
}

interface CompleteRoastAnalysisInput {
  submissionId: string;
  score: RoastResultInsert["score"];
  verdict: RoastResultInsert["verdict"];
  roastQuote: string;
  model?: string | null;
  findings: Omit<AnalysisFindingInsert, "id" | "roastResultId" | "createdAt">[];
  diffLines: Omit<
    SuggestedDiffLineInsert,
    "id" | "roastResultId" | "createdAt"
  >[];
}

interface FailRoastAnalysisInput {
  submissionId: string;
  errorMessage: string;
}

export async function createSubmission(input: CreateSubmissionInput) {
  const now = new Date();

  return db.transaction(async (tx) => {
    const [submission] = await tx
      .insert(submissions)
      .values({
        code: input.code,
        language: input.language,
        lineCount: input.lineCount,
        roastMode: input.roastMode,
        visibility: input.visibility ?? "public",
        fingerprint: input.fingerprint,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const [roastResult] = await tx
      .insert(roastResults)
      .values({
        submissionId: submission.id,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return { submission, roastResult };
  });
}

export async function markRoastProcessing(submissionId: string) {
  return db
    .update(roastResults)
    .set({
      status: "processing",
      updatedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(roastResults.submissionId, submissionId))
    .returning();
}

export async function completeRoastAnalysis(input: CompleteRoastAnalysisInput) {
  const now = new Date();

  return db.transaction(async (tx) => {
    const [result] = await tx
      .select({
        roastResultId: roastResults.id,
      })
      .from(roastResults)
      .where(eq(roastResults.submissionId, input.submissionId))
      .limit(1);

    if (!result) {
      throw new Error("Roast result not found for submission");
    }

    await tx
      .update(roastResults)
      .set({
        status: "completed",
        score: input.score,
        verdict: input.verdict,
        roastQuote: input.roastQuote,
        model: input.model ?? null,
        errorMessage: null,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(roastResults.id, result.roastResultId));

    await tx
      .delete(analysisFindings)
      .where(eq(analysisFindings.roastResultId, result.roastResultId));

    if (input.findings.length > 0) {
      await tx.insert(analysisFindings).values(
        input.findings.map((finding) => ({
          roastResultId: result.roastResultId,
          position: finding.position,
          tone: finding.tone,
          title: finding.title,
          description: finding.description,
          createdAt: now,
        })),
      );
    }

    await tx
      .delete(suggestedDiffLines)
      .where(eq(suggestedDiffLines.roastResultId, result.roastResultId));

    if (input.diffLines.length > 0) {
      await tx.insert(suggestedDiffLines).values(
        input.diffLines.map((line) => ({
          roastResultId: result.roastResultId,
          position: line.position,
          lineType: line.lineType,
          content: line.content,
          createdAt: now,
        })),
      );
    }

    return getRoastResultBySubmissionId(input.submissionId);
  });
}

export async function failRoastAnalysis(input: FailRoastAnalysisInput) {
  return db
    .update(roastResults)
    .set({
      status: "failed",
      errorMessage: input.errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(roastResults.submissionId, input.submissionId))
    .returning();
}

export async function getRoastResultBySubmissionId(submissionId: string) {
  const [result] = await db
    .select({
      roastResultId: roastResults.id,
      submissionId: submissions.id,
      code: submissions.code,
      language: submissions.language,
      lineCount: submissions.lineCount,
      roastMode: submissions.roastMode,
      score: roastResults.score,
      verdict: roastResults.verdict,
      roastQuote: roastResults.roastQuote,
      status: roastResults.status,
      completedAt: roastResults.completedAt,
      createdAt: roastResults.createdAt,
    })
    .from(roastResults)
    .innerJoin(submissions, eq(roastResults.submissionId, submissions.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!result) {
    return null;
  }

  const findings = await db
    .select({
      id: analysisFindings.id,
      position: analysisFindings.position,
      tone: analysisFindings.tone,
      title: analysisFindings.title,
      description: analysisFindings.description,
    })
    .from(analysisFindings)
    .where(eq(analysisFindings.roastResultId, result.roastResultId))
    .orderBy(asc(analysisFindings.position));

  const diffLines = await db
    .select({
      id: suggestedDiffLines.id,
      position: suggestedDiffLines.position,
      lineType: suggestedDiffLines.lineType,
      content: suggestedDiffLines.content,
    })
    .from(suggestedDiffLines)
    .where(eq(suggestedDiffLines.roastResultId, result.roastResultId))
    .orderBy(asc(suggestedDiffLines.position));

  return {
    ...result,
    findings,
    diffLines,
  };
}

export async function listLeaderboard(limit = 20, offset = 0) {
  return db
    .select({
      submissionId: leaderboardEntries.submissionId,
      roastResultId: leaderboardEntries.roastResultId,
      score: leaderboardEntries.score,
      language: leaderboardEntries.language,
      lineCount: leaderboardEntries.lineCount,
      codePreview: leaderboardEntries.codePreview,
      createdAt: leaderboardEntries.createdAt,
    })
    .from(leaderboardEntries)
    .orderBy(asc(leaderboardEntries.score), asc(leaderboardEntries.createdAt))
    .limit(limit)
    .offset(offset);
}
