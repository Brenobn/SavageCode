import assert from "node:assert/strict";
import test from "node:test";
import { createAndAnalyzeRoast } from "./roast";

test("createAndAnalyzeRoast returns roastId on success", async () => {
  const calls: string[] = [];
  let completePayload: unknown;

  const roastId = await createAndAnalyzeRoast(
    {
      code: "const x = 1",
      language: "javascript",
      roastMode: "normal",
    },
    {
      createSubmission: async () => {
        calls.push("create");

        return {
          submission: { id: "sub-1" },
          roastResult: { id: "rr-1" },
        };
      },
      markRoastProcessing: async () => {
        calls.push("processing");

        return [];
      },
      analyzeRoast: async () => {
        calls.push("analyze");

        return {
          score: 4.2,
          verdict: "needs_work",
          roastQuote: "oof",
          findings: [],
          diffLines: [],
        };
      },
      completeRoastAnalysis: async (input) => {
        calls.push("complete");

        completePayload = input;

        return null;
      },
      failRoastAnalysis: async () => {
        calls.push("fail");

        return [];
      },
    },
  );

  assert.equal(roastId, "sub-1");
  assert.deepEqual(calls, ["create", "processing", "analyze", "complete"]);
  assert.deepEqual(completePayload, {
    submissionId: "sub-1",
    score: "4.2",
    verdict: "needs_work",
    roastQuote: "oof",
    model: "gpt-4o-mini",
    findings: [],
    diffLines: [],
  });
});

test("createAndAnalyzeRoast marks failure when analyzer throws", async () => {
  let failed = false;
  let failPayload: unknown;

  await assert.rejects(
    () =>
      createAndAnalyzeRoast(
        {
          code: "x",
          language: "typescript",
          roastMode: "maximum",
        },
        {
          createSubmission: async () => ({
            submission: { id: "sub-1" },
          }),
          markRoastProcessing: async () => [],
          analyzeRoast: async () => {
            throw new Error("provider timeout");
          },
          completeRoastAnalysis: async () => null,
          failRoastAnalysis: async (input) => {
            failed = true;
            failPayload = input;

            return [];
          },
        },
      ),
    /provider timeout/i,
  );

  assert.equal(failed, true);
  assert.deepEqual(failPayload, {
    submissionId: "sub-1",
    errorMessage: "provider timeout",
  });
});
