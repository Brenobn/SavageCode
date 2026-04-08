import assert from "node:assert/strict";
import test from "node:test";

import { analyzeRoast, RoastAnalyzerError } from "./roast-analyzer";

test("analyzeRoast returns normalized payload on valid provider response", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        output_parsed: {
          score: 2.7,
          verdict: "needs_work",
          roastQuote: "ship this and call your lawyer",
          findings: [
            {
              position: 1,
              tone: "critical",
              title: "var",
              description: "Use const/let",
            },
          ],
          diffLines: [
            { position: 1, lineType: "removed", content: "var x = 1" },
            { position: 2, lineType: "added", content: "const x = 1" },
          ],
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  const result = await analyzeRoast(
    { code: "var x = 1", language: "javascript", roastMode: "maximum" },
    { fetchImpl: fakeFetch, apiKey: "test", model: "gpt-4o-mini" },
  );

  assert.equal(result.score, 2.7);
  assert.equal(result.verdict, "needs_work");
  assert.equal(result.findings.length, 1);
});

test("analyzeRoast throws typed error on invalid payload", async () => {
  const badFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ output_parsed: { score: "bad" } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(async () => {
    try {
      await analyzeRoast(
        { code: "x", language: "javascript", roastMode: "normal" },
        { fetchImpl: badFetch, apiKey: "test", model: "gpt-4o-mini" },
      );
    } catch (error) {
      assert.ok(error instanceof RoastAnalyzerError);
      assert.match((error as Error).message, /invalid roast payload/i);
      throw error;
    }
  });
});

test("analyzeRoast throws typed error when OPENAI_API_KEY is missing", async () => {
  await assert.rejects(async () => {
    try {
      await analyzeRoast(
        { code: "const x = 1", language: "javascript", roastMode: "normal" },
        { apiKey: "", model: "gpt-4o-mini" },
      );
    } catch (error) {
      assert.ok(error instanceof RoastAnalyzerError);
      assert.match((error as Error).message, /openai_api_key is required/i);
      throw error;
    }
  });
});

test("analyzeRoast throws typed error when provider returns non-ok status", async () => {
  const nonOkFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "boom" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(async () => {
    try {
      await analyzeRoast(
        { code: "const x = 1", language: "javascript", roastMode: "normal" },
        { fetchImpl: nonOkFetch, apiKey: "test", model: "gpt-4o-mini" },
      );
    } catch (error) {
      assert.ok(error instanceof RoastAnalyzerError);
      assert.match((error as Error).message, /provider request failed/i);
      throw error;
    }
  });
});

test("analyzeRoast throws typed error on invalid payload shape", async () => {
  const malformedEnvelopeFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ output_parsed: 42 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(async () => {
    try {
      await analyzeRoast(
        { code: "const x = 1", language: "javascript", roastMode: "normal" },
        {
          fetchImpl: malformedEnvelopeFetch,
          apiKey: "test",
          model: "gpt-4o-mini",
        },
      );
    } catch (error) {
      assert.ok(error instanceof RoastAnalyzerError);
      assert.match((error as Error).message, /invalid roast payload/i);
      throw error;
    }
  });
});

test("analyzeRoast throws typed error on invalid provider JSON", async () => {
  const invalidJsonFetch: typeof fetch = async () =>
    new Response("{broken-json", {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(async () => {
    try {
      await analyzeRoast(
        { code: "const x = 1", language: "javascript", roastMode: "normal" },
        {
          fetchImpl: invalidJsonFetch,
          apiKey: "test",
          model: "gpt-4o-mini",
        },
      );
    } catch (error) {
      assert.ok(error instanceof RoastAnalyzerError);
      assert.match((error as Error).message, /invalid ai provider json/i);
      throw error;
    }
  });
});
