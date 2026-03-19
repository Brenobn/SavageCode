import "dotenv/config";

import { db, postgresClient } from "./client";
import { analysisFindings } from "./schema/analysis-findings";
import { roastResults } from "./schema/roast-results";
import { submissions } from "./schema/submissions";
import { suggestedDiffLines } from "./schema/suggested-diff-lines";

interface SeedSubmission {
  key: string;
  code: string;
  language: (typeof submissions.$inferInsert)["language"];
  roastMode: (typeof submissions.$inferInsert)["roastMode"];
  visibility: (typeof submissions.$inferInsert)["visibility"];
}

function requiredValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Missing required seed value: ${label}`);
  }

  return value;
}

function countLines(input: string) {
  return input.length === 0 ? 0 : input.split("\n").length;
}

const seedSubmissions: SeedSubmission[] = [
  {
    key: "rank-1",
    code: "function calculateTotal(items) {\n  var total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
    language: "javascript",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-2",
    code: "if (isLoggedIn = true) {\n  return dashboard();\n}\nreturn login();",
    language: "typescript",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-3",
    code: "SELECT * FROM users WHERE email = input;",
    language: "sql",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "hidden",
    code: "for (;;) {\n  // mystery loop\n}",
    language: "javascript",
    roastMode: "normal",
    visibility: "unlisted",
  },
  {
    key: "failed",
    code: "echo 'hello world'",
    language: "bash",
    roastMode: "normal",
    visibility: "public",
  },
];

async function runSeed() {
  await db.transaction(async (tx) => {
    await tx.delete(analysisFindings);
    await tx.delete(suggestedDiffLines);
    await tx.delete(roastResults);
    await tx.delete(submissions);

    const insertedSubmissions = await tx
      .insert(submissions)
      .values(
        seedSubmissions.map((submission) => ({
          code: submission.code,
          language: submission.language,
          lineCount: countLines(submission.code),
          roastMode: submission.roastMode,
          visibility: submission.visibility,
        })),
      )
      .returning({ id: submissions.id });

    const submissionIdByKey = new Map<string, string>();

    for (const [index, submission] of seedSubmissions.entries()) {
      submissionIdByKey.set(submission.key, insertedSubmissions[index].id);
    }

    const insertedResults = await tx
      .insert(roastResults)
      .values([
        {
          submissionId: requiredValue(
            submissionIdByKey.get("rank-1"),
            "submission rank-1",
          ),
          status: "completed",
          score: "2.1",
          verdict: "needs_serious_help",
          roastQuote: "This loop has more trust issues than your test suite.",
          model: "gpt-5.3",
          completedAt: new Date(),
        },
        {
          submissionId: requiredValue(
            submissionIdByKey.get("rank-2"),
            "submission rank-2",
          ),
          status: "completed",
          score: "2.4",
          verdict: "needs_work",
          roastQuote: "Assignment inside an if? Bold strategy.",
          model: "gpt-5.3",
          completedAt: new Date(),
        },
        {
          submissionId: requiredValue(
            submissionIdByKey.get("rank-3"),
            "submission rank-3",
          ),
          status: "completed",
          score: "2.8",
          verdict: "needs_work",
          roastQuote: "SELECT * plus raw input is a speedrun to regret.",
          model: "gpt-5.3",
          completedAt: new Date(),
        },
        {
          submissionId: requiredValue(
            submissionIdByKey.get("hidden"),
            "submission hidden",
          ),
          status: "completed",
          score: "1.7",
          verdict: "needs_serious_help",
          roastQuote: "Infinite loop, infinite confidence.",
          model: "gpt-5.3",
          completedAt: new Date(),
        },
        {
          submissionId: requiredValue(
            submissionIdByKey.get("failed"),
            "submission failed",
          ),
          status: "failed",
          errorMessage: "Provider timeout while generating roast",
          model: "gpt-5.3",
        },
      ])
      .returning({
        id: roastResults.id,
        submissionId: roastResults.submissionId,
      });

    const roastResultIdBySubmissionId = new Map<string, string>();

    for (const result of insertedResults) {
      roastResultIdBySubmissionId.set(result.submissionId, result.id);
    }

    const rank1ResultId = roastResultIdBySubmissionId.get(
      requiredValue(submissionIdByKey.get("rank-1"), "submission rank-1"),
    );
    const rank2ResultId = roastResultIdBySubmissionId.get(
      requiredValue(submissionIdByKey.get("rank-2"), "submission rank-2"),
    );
    const rank3ResultId = roastResultIdBySubmissionId.get(
      requiredValue(submissionIdByKey.get("rank-3"), "submission rank-3"),
    );

    const rank1ResultIdRequired = requiredValue(rank1ResultId, "result rank-1");
    const rank2ResultIdRequired = requiredValue(rank2ResultId, "result rank-2");
    const rank3ResultIdRequired = requiredValue(rank3ResultId, "result rank-3");

    await tx.insert(analysisFindings).values([
      {
        roastResultId: rank1ResultIdRequired,
        position: 1,
        tone: "critical",
        title: "var usage in modern JS",
        description:
          "Use const by default and let when reassignment is necessary to avoid accidental scope leakage.",
      },
      {
        roastResultId: rank1ResultIdRequired,
        position: 2,
        tone: "warning",
        title: "Imperative loop can be simplified",
        description:
          "A reduce expression is shorter and communicates the accumulation intent more clearly.",
      },
      {
        roastResultId: rank2ResultIdRequired,
        position: 1,
        tone: "critical",
        title: "Assignment in conditional",
        description:
          "Use strict comparison (===) instead of assignment (=) in conditions to avoid logic bugs.",
      },
      {
        roastResultId: rank3ResultIdRequired,
        position: 1,
        tone: "critical",
        title: "Potential SQL injection",
        description:
          "Never interpolate raw input in SQL; use parameterized statements.",
      },
    ]);

    await tx.insert(suggestedDiffLines).values([
      {
        roastResultId: rank1ResultIdRequired,
        position: 1,
        lineType: "removed",
        content: "var total = 0;",
      },
      {
        roastResultId: rank1ResultIdRequired,
        position: 2,
        lineType: "added",
        content:
          "const total = items.reduce((sum, item) => sum + item.price, 0);",
      },
      {
        roastResultId: rank2ResultIdRequired,
        position: 1,
        lineType: "removed",
        content: "if (isLoggedIn = true) {",
      },
      {
        roastResultId: rank2ResultIdRequired,
        position: 2,
        lineType: "added",
        content: "if (isLoggedIn === true) {",
      },
      {
        roastResultId: rank3ResultIdRequired,
        position: 1,
        lineType: "context",
        content: "SELECT * FROM users WHERE email = $1;",
      },
    ]);
  });

  console.log("Seed completed.");
}

runSeed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await postgresClient.end();
  });
