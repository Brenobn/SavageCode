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

interface SeedCompletedResult {
  key: string;
  score: string;
  verdict: (typeof roastResults.$inferInsert)["verdict"];
  roastQuote: string;
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
  {
    key: "rank-4",
    code: 'const users = await db.query("SELECT * FROM users");\nreturn users[0];',
    language: "typescript",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-5",
    code: "password = request.body.password\nprint(password)",
    language: "python",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-6",
    code: "let retries = 0;\nwhile (true) {\n  tryWork();\n  retries++;\n}",
    language: "javascript",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-7",
    code: "if err != nil {\n  // ignore\n}\nreturn nil",
    language: "go",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-8",
    code: `SELECT * FROM orders WHERE id = '\${id}';`,
    language: "sql",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-9",
    code: "const cache = {};\nitems.map((item) => (cache[item.id] = item));\nreturn cache;",
    language: "javascript",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-10",
    code: "try {\n  risky();\n} catch (e) {}",
    language: "java",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-11",
    code: 'const query = "DELETE FROM logs";\nawait prisma.$executeRawUnsafe(query);',
    language: "typescript",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-12",
    code: 'for user in users:\n    send_email("admin@corp.com", user.password)',
    language: "python",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-13",
    code: 'curl -X POST $URL -d "token=$TOKEN"',
    language: "bash",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-14",
    code: "const now = new Date();\nsetInterval(() => save(now), 1000);",
    language: "javascript",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-15",
    code: "<input value={value} onChange={() => {}} />",
    language: "typescript",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-16",
    code: 'def is_admin(user):\n    return user.role == "admin" or True',
    language: "python",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-17",
    code: "UPDATE users SET role = 'admin';",
    language: "sql",
    roastMode: "maximum",
    visibility: "public",
  },
  {
    key: "rank-18",
    code: "const data = await fetch(url);\nJSON.parse(await data.text());\nJSON.parse(await data.text());",
    language: "javascript",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-19",
    code: "if (enabled) {\n  return true;\n}\nreturn true;",
    language: "go",
    roastMode: "normal",
    visibility: "public",
  },
  {
    key: "rank-20",
    code: "const secret = process.env.JWT_SECRET;\nconsole.log(secret);",
    language: "typescript",
    roastMode: "maximum",
    visibility: "public",
  },
];

const completedResults: SeedCompletedResult[] = [
  {
    key: "rank-1",
    score: "2.1",
    verdict: "needs_serious_help",
    roastQuote: "This loop has more trust issues than your test suite.",
  },
  {
    key: "rank-2",
    score: "2.4",
    verdict: "needs_work",
    roastQuote: "Assignment inside an if? Bold strategy.",
  },
  {
    key: "rank-3",
    score: "2.8",
    verdict: "needs_work",
    roastQuote: "SELECT * plus raw input is a speedrun to regret.",
  },
  {
    key: "rank-4",
    score: "3.1",
    verdict: "needs_work",
    roastQuote: "Taking the first row forever is confidence, not correctness.",
  },
  {
    key: "rank-5",
    score: "3.3",
    verdict: "needs_work",
    roastQuote: "Logs are not a password manager.",
  },
  {
    key: "rank-6",
    score: "3.5",
    verdict: "needs_work",
    roastQuote: "Infinite loops are still loops.",
  },
  {
    key: "rank-7",
    score: "3.7",
    verdict: "needs_work",
    roastQuote: "Ignoring errors does not make them optional.",
  },
  {
    key: "rank-8",
    score: "3.9",
    verdict: "needs_work",
    roastQuote: "String-built SQL still bites.",
  },
  {
    key: "rank-9",
    score: "4.1",
    verdict: "needs_work",
    roastQuote: "Side effects in map are a classic code smell.",
  },
  {
    key: "rank-10",
    score: "4.2",
    verdict: "decent",
    roastQuote: "Silent catches produce loud outages.",
  },
  {
    key: "rank-11",
    score: "4.4",
    verdict: "decent",
    roastQuote: "Unsafe raw query, what could possibly go wrong?",
  },
  {
    key: "rank-12",
    score: "4.6",
    verdict: "decent",
    roastQuote: "Broadcasting passwords is not collaboration.",
  },
  {
    key: "rank-13",
    score: "4.8",
    verdict: "decent",
    roastQuote: "Shell one-liners can still leak secrets.",
  },
  {
    key: "rank-14",
    score: "5.0",
    verdict: "decent",
    roastQuote: "Captured timestamp means timeless bugs.",
  },
  {
    key: "rank-15",
    score: "5.2",
    verdict: "decent",
    roastQuote: "Read-only inputs are interactive cosplay.",
  },
  {
    key: "rank-16",
    score: "5.4",
    verdict: "decent",
    roastQuote: "or True is the admin shortcut no one asked for.",
  },
  {
    key: "rank-17",
    score: "5.6",
    verdict: "clean",
    roastQuote: "Mass role updates are thrilling in production.",
  },
  {
    key: "rank-18",
    score: "5.8",
    verdict: "clean",
    roastQuote:
      "Parsing the same payload twice is efficient at wasting cycles.",
  },
  {
    key: "rank-19",
    score: "6.0",
    verdict: "clean",
    roastQuote: "At least your branch coverage is honest.",
  },
  {
    key: "rank-20",
    score: "6.2",
    verdict: "clean",
    roastQuote: "Printing secrets is observability with consequences.",
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
        ...completedResults.map((result) => ({
          submissionId: requiredValue(
            submissionIdByKey.get(result.key),
            `submission ${result.key}`,
          ),
          status: "completed" as const,
          score: result.score,
          verdict: result.verdict,
          roastQuote: result.roastQuote,
          model: "gpt-5.3",
          completedAt: new Date(),
        })),
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
