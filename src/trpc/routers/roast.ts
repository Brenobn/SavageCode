import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

const languageSchema = z.enum([
  "javascript",
  "typescript",
  "sql",
  "java",
  "python",
  "bash",
  "go",
  "rust",
  "csharp",
  "cpp",
  "php",
  "ruby",
  "unknown",
]);

const createRoastInputSchema = z.object({
  code: z.string().trim().min(1).max(2000),
  language: languageSchema,
  roastMode: z.enum(["normal", "maximum"]),
});

type CreateAndAnalyzeRoastInput = z.infer<typeof createRoastInputSchema>;

type CreateSubmissionFn = typeof import("@/db/queries/roasts").createSubmission;
type CompleteRoastAnalysisFn =
  typeof import("@/db/queries/roasts").completeRoastAnalysis;
type FailRoastAnalysisFn =
  typeof import("@/db/queries/roasts").failRoastAnalysis;
type RoastPayload = import("@/lib/roast-analyzer").RoastPayload;

type CreateSubmissionInput = Parameters<CreateSubmissionFn>[0];
type CompleteRoastAnalysisInput = Parameters<CompleteRoastAnalysisFn>[0];
type FailRoastAnalysisInput = Parameters<FailRoastAnalysisFn>[0];

type CreateAndAnalyzeRoastDeps = {
  createSubmission: (
    input: CreateSubmissionInput,
  ) => Promise<{ submission: { id: string } }>;
  markRoastProcessing: (
    submissionId: string,
  ) => ReturnType<typeof import("@/db/queries/roasts").markRoastProcessing>;
  analyzeRoast: (input: CreateAndAnalyzeRoastInput) => Promise<RoastPayload>;
  completeRoastAnalysis: (
    input: CompleteRoastAnalysisInput,
  ) => ReturnType<typeof import("@/db/queries/roasts").completeRoastAnalysis>;
  failRoastAnalysis: (
    input: FailRoastAnalysisInput,
  ) => ReturnType<typeof import("@/db/queries/roasts").failRoastAnalysis>;
};

async function getDefaultDeps(): Promise<CreateAndAnalyzeRoastDeps> {
  const roastQueries = await import("@/db/queries/roasts");
  const roastAnalyzer = await import("@/lib/roast-analyzer");

  return {
    createSubmission: roastQueries.createSubmission,
    markRoastProcessing: roastQueries.markRoastProcessing,
    analyzeRoast: roastAnalyzer.analyzeRoast,
    completeRoastAnalysis: roastQueries.completeRoastAnalysis,
    failRoastAnalysis: roastQueries.failRoastAnalysis,
  };
}

export async function createAndAnalyzeRoast(
  input: CreateAndAnalyzeRoastInput,
  deps?: CreateAndAnalyzeRoastDeps,
) {
  const resolvedDeps = deps ?? (await getDefaultDeps());

  const { submission } = await resolvedDeps.createSubmission({
    code: input.code,
    language: input.language,
    lineCount: input.code.split(/\r?\n/).length,
    roastMode: input.roastMode,
    visibility: "public",
  });

  await resolvedDeps.markRoastProcessing(submission.id);

  try {
    const analysis = await resolvedDeps.analyzeRoast(input);

    await resolvedDeps.completeRoastAnalysis({
      submissionId: submission.id,
      score: analysis.score.toString(),
      verdict: analysis.verdict,
      roastQuote: analysis.roastQuote,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      findings: analysis.findings,
      diffLines: analysis.diffLines,
    });

    return submission.id;
  } catch (error) {
    const originalError = error;
    try {
      await resolvedDeps.failRoastAnalysis({
        submissionId: submission.id,
        errorMessage:
          error instanceof Error ? error.message : "Unknown analysis error",
      });
    } catch {
      // Preserve original analysis error for upstream handling.
    }

    throw originalError;
  }
}

export const roastRouter = createTRPCRouter({
  createAndAnalyze: publicProcedure
    .input(createRoastInputSchema)
    .mutation(async ({ input }) => {
      try {
        const roastId = await createAndAnalyzeRoast(input);

        return { roastId };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze code. Please try again.",
        });
      }
    }),
});
