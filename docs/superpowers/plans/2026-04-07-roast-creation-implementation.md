# Roast Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to submit code from the homepage, run synchronous AI roast analysis, persist the result, and navigate to a real `/result/[roastId]` page on success.

**Architecture:** Add a new `roast.createAndAnalyze` tRPC mutation as the orchestration boundary, with a dedicated AI analyzer service for provider calls and strict output normalization. Keep database writes in existing `src/db/queries/roasts.ts` helpers and wire home UI to mutation loading/error states, redirecting only after success. Render result page from persisted database data (no static fixture for main path), while preserving UUID/numeric route compatibility.

**Tech Stack:** Next.js App Router, TypeScript, tRPC v11 + TanStack Query, Zod, Drizzle ORM, Node `--test` via `tsx`, OpenAI Responses HTTP API (JSON schema output).

---

## File Structure and Responsibilities

- `src/lib/roast-analyzer.ts` (create)
  - Calls LLM provider and returns normalized roast payload for persistence.
- `src/lib/roast-analyzer.test.ts` (create)
  - Tests analyzer success/failure parsing with mocked fetch.
- `src/trpc/routers/roast.ts` (create)
  - tRPC mutation input validation + orchestration + error mapping.
- `src/trpc/routers/roast.test.ts` (create)
  - Tests mutation flow state transitions (success/failure) via mocked dependencies.
- `src/trpc/routers/_app.ts` (modify)
  - Register new `roast` router.
- `src/components/home/home-page-client.tsx` (modify)
  - Hook submit action to mutation and implement loading/error UX.
- `src/app/result/[roastId]/page.tsx` (modify)
  - Replace static data usage with persisted DB data loader.
- `src/lib/roast-result-view-model.ts` (create)
  - Maps DB roast record to UI-friendly shape for result page.
- `src/lib/roast-result-view-model.test.ts` (create)
  - Tests mapping behavior and tone/verdict label conversions.
- `.env.example` (modify)
  - Add required AI provider env vars.
- `README.md` (modify)
  - Document roast API env setup and local verification flow.

### Task 1: Build AI Analyzer Service (Provider + Normalization)

**Files:**
- Create: `src/lib/roast-analyzer.ts`
- Create: `src/lib/roast-analyzer.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Write failing analyzer tests for success and malformed-provider responses**

```ts
// src/lib/roast-analyzer.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRoast } from "./roast-analyzer";

test("analyzeRoast returns normalized payload on valid provider response", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        output_parsed: {
          score: 2.7,
          verdict: "needs_work",
          roastQuote: "ship this and call your lawyer",
          findings: [
            { position: 1, tone: "critical", title: "var", description: "Use const/let" },
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

  await assert.rejects(
    () =>
      analyzeRoast(
        { code: "x", language: "javascript", roastMode: "normal" },
        { fetchImpl: badFetch, apiKey: "test", model: "gpt-4o-mini" },
      ),
    /invalid roast payload/i,
  );
});
```

- [ ] **Step 2: Run tests and verify RED state**

Run: `npx tsx --test src/lib/roast-analyzer.test.ts`
Expected: FAIL because `analyzeRoast` does not exist yet.

- [ ] **Step 3: Implement minimal analyzer with strict Zod schema + provider call**

```ts
// src/lib/roast-analyzer.ts
import { z } from "zod";

const roastPayloadSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.enum(["needs_serious_help", "needs_work", "decent", "clean"]),
  roastQuote: z.string().min(1),
  findings: z.array(
    z.object({
      position: z.number().int().nonnegative(),
      tone: z.enum(["critical", "warning", "good", "muted"]),
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
  diffLines: z.array(
    z.object({
      position: z.number().int().nonnegative(),
      lineType: z.enum(["context", "removed", "added"]),
      content: z.string(),
    }),
  ),
});

type AnalyzeRoastInput = {
  code: string;
  language: string;
  roastMode: "normal" | "maximum";
};

type AnalyzeRoastDeps = {
  fetchImpl?: typeof fetch;
  apiKey?: string;
  model?: string;
};

export async function analyzeRoast(input: AnalyzeRoastInput, deps: AnalyzeRoastDeps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const apiKey = deps.apiKey ?? process.env.OPENAI_API_KEY;
  const model = deps.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: "You are DevRoast. Return strict JSON payload only.",
        },
        {
          role: "user",
          content: `language=${input.language}\nmode=${input.roastMode}\ncode:\n${input.code}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "roast_payload",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "number" },
              verdict: { type: "string", enum: ["needs_serious_help", "needs_work", "decent", "clean"] },
              roastQuote: { type: "string" },
              findings: { type: "array" },
              diffLines: { type: "array" },
            },
            required: ["score", "verdict", "roastQuote", "findings", "diffLines"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("AI provider request failed");
  }

  const json = await response.json();
  const parsed = roastPayloadSchema.safeParse(json.output_parsed);

  if (!parsed.success) {
    throw new Error("Invalid roast payload from AI provider");
  }

  return parsed.data;
}
```

- [ ] **Step 4: Re-run tests and verify GREEN state**

Run: `npx tsx --test src/lib/roast-analyzer.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit analyzer foundation**

```bash
git add src/lib/roast-analyzer.ts src/lib/roast-analyzer.test.ts .env.example
git commit -m "feat(roast): add ai analyzer service with structured output validation"
```

### Task 2: Add tRPC Roast Mutation and Persisted Workflow

**Files:**
- Create: `src/trpc/routers/roast.ts`
- Create: `src/trpc/routers/roast.test.ts`
- Modify: `src/trpc/routers/_app.ts`

- [ ] **Step 1: Write failing orchestration tests (success and failure transitions)**

```ts
// src/trpc/routers/roast.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { createAndAnalyzeRoast } from "./roast";

test("createAndAnalyzeRoast returns roastId on success", async () => {
  const calls: string[] = [];
  const roastId = await createAndAnalyzeRoast(
    { code: "const x=1", language: "javascript", roastMode: "normal" },
    {
      createSubmission: async () => {
        calls.push("create");
        return { submission: { id: "sub-1" }, roastResult: { id: "rr-1" } } as any;
      },
      markRoastProcessing: async () => {
        calls.push("processing");
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
      completeRoastAnalysis: async () => {
        calls.push("complete");
      },
      failRoastAnalysis: async () => {
        calls.push("fail");
      },
    },
  );

  assert.equal(roastId, "sub-1");
  assert.deepEqual(calls, ["create", "processing", "analyze", "complete"]);
});

test("createAndAnalyzeRoast marks failure when analyzer throws", async () => {
  let failed = false;

  await assert.rejects(() =>
    createAndAnalyzeRoast(
      { code: "x", language: "javascript", roastMode: "maximum" },
      {
        createSubmission: async () => ({ submission: { id: "sub-1" }, roastResult: { id: "rr-1" } } as any),
        markRoastProcessing: async () => undefined,
        analyzeRoast: async () => {
          throw new Error("provider timeout");
        },
        completeRoastAnalysis: async () => undefined,
        failRoastAnalysis: async () => {
          failed = true;
        },
      },
    ),
  );

  assert.equal(failed, true);
});
```

- [ ] **Step 2: Run tests and verify RED state**

Run: `npx tsx --test src/trpc/routers/roast.test.ts`
Expected: FAIL because `roast.ts` does not export `createAndAnalyzeRoast` yet.

- [ ] **Step 3: Implement router mutation + orchestration function**

```ts
// src/trpc/routers/roast.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  completeRoastAnalysis,
  createSubmission,
  failRoastAnalysis,
  markRoastProcessing,
} from "@/db/queries/roasts";
import { analyzeRoast } from "@/lib/roast-analyzer";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

const createRoastInputSchema = z.object({
  code: z.string().trim().min(1).max(2000),
  language: z.string().trim().min(1),
  roastMode: z.enum(["normal", "maximum"]),
});

type CreateAndAnalyzeRoastDeps = {
  createSubmission: typeof createSubmission;
  markRoastProcessing: typeof markRoastProcessing;
  analyzeRoast: typeof analyzeRoast;
  completeRoastAnalysis: typeof completeRoastAnalysis;
  failRoastAnalysis: typeof failRoastAnalysis;
};

const defaultDeps: CreateAndAnalyzeRoastDeps = {
  createSubmission,
  markRoastProcessing,
  analyzeRoast,
  completeRoastAnalysis,
  failRoastAnalysis,
};

export async function createAndAnalyzeRoast(
  input: z.infer<typeof createRoastInputSchema>,
  deps: CreateAndAnalyzeRoastDeps = defaultDeps,
) {
  const { submission } = await deps.createSubmission({
    code: input.code,
    language: input.language as any,
    lineCount: input.code.split("\n").length,
    roastMode: input.roastMode,
    visibility: "public",
  });

  await deps.markRoastProcessing(submission.id);

  try {
    const analysis = await deps.analyzeRoast(input);

    await deps.completeRoastAnalysis({
      submissionId: submission.id,
      score: analysis.score.toString() as any,
      verdict: analysis.verdict as any,
      roastQuote: analysis.roastQuote,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      findings: analysis.findings,
      diffLines: analysis.diffLines,
    });

    return submission.id;
  } catch (error) {
    await deps.failRoastAnalysis({
      submissionId: submission.id,
      errorMessage:
        error instanceof Error ? error.message : "Unknown analysis error",
    });

    throw error;
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
```

Update router registration:

```ts
// src/trpc/routers/_app.ts
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  metrics: metricsRouter,
  roast: roastRouter,
});
```

- [ ] **Step 4: Re-run tests and verify GREEN state**

Run: `npx tsx --test src/trpc/routers/roast.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit router workflow**

```bash
git add src/trpc/routers/roast.ts src/trpc/routers/roast.test.ts src/trpc/routers/_app.ts
git commit -m "feat(roast): add synchronous create-and-analyze mutation"
```

### Task 3: Connect Homepage Submit UX to New Mutation

**Files:**
- Modify: `src/components/home/home-page-client.tsx`

- [ ] **Step 1: Write failing UI-state helper test for submit lifecycle**

```ts
// Add in src/components/home/home-page-client.tsx first as pure helper (exported)
export function getSubmitButtonLabel(isSubmitting: boolean) {
  return isSubmitting ? "$ roasting..." : "$ roast_my_code";
}
```

Then create test:

```ts
// src/components/home/home-page-client.submit-label.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { getSubmitButtonLabel } from "./home-page-client";

test("submit button label switches during submit", () => {
  assert.equal(getSubmitButtonLabel(false), "$ roast_my_code");
  assert.equal(getSubmitButtonLabel(true), "$ roasting...");
});
```

- [ ] **Step 2: Run tests and verify RED state**

Run: `npx tsx --test src/components/home/home-page-client.submit-label.test.ts`
Expected: FAIL because helper is not exported yet.

- [ ] **Step 3: Implement mutation submit wiring with loading + inline error UX**

```tsx
// src/components/home/home-page-client.tsx (key additions)
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TRPCReactProvider, useTRPC } from "@/trpc/client";

function HomePageClientContent(...) {
  const router = useRouter();
  const trpc = useTRPC();
  const [roastModeEnabled, setRoastModeEnabled] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const roastMutation = useMutation(
    trpc.roast.createAndAnalyze.mutationOptions({
      onMutate: () => setSubmitError(null),
      onSuccess: ({ roastId }) => router.push(`/result/${roastId}`),
      onError: (error) => {
        setSubmitError(error.message || "Failed to analyze code. Please try again.");
      },
    }),
  );

  const handleSubmit = () => {
    roastMutation.mutate({
      code,
      language: detectedLanguage,
      roastMode: roastModeEnabled ? "maximum" : "normal",
    });
  };
}

export function HomePageClient(props: HomePageClientProps) {
  return (
    <TRPCReactProvider>
      <HomePageClientContent {...props} />
    </TRPCReactProvider>
  );
}
```

- [ ] **Step 4: Re-run tests and verify GREEN state**

Run: `npx tsx --test src/components/home/home-page-client.submit-label.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit homepage mutation UX integration**

```bash
git add src/components/home/home-page-client.tsx src/components/home/home-page-client.submit-label.test.ts
git commit -m "feat(home): submit code to roast mutation with loading and inline error states"
```

### Task 4: Replace Static Result Page with Persisted Roast Data

**Files:**
- Create: `src/lib/roast-result-view-model.ts`
- Create: `src/lib/roast-result-view-model.test.ts`
- Modify: `src/app/result/[roastId]/page.tsx`

- [ ] **Step 1: Write failing mapping tests for verdict/tone conversion**

```ts
// src/lib/roast-result-view-model.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { toRoastResultViewModel } from "./roast-result-view-model";

test("maps persisted roast data into result page view model", () => {
  const vm = toRoastResultViewModel({
    score: "3.2",
    verdict: "needs_serious_help",
    roastQuote: "ouch",
    language: "typescript",
    lineCount: 12,
    code: "const x = 1",
    findings: [{ position: 1, tone: "critical", title: "title", description: "desc" }],
    diffLines: [{ position: 1, lineType: "added", content: "const x = 1" }],
  } as any);

  assert.equal(vm.verdictLabel, "verdict: needs_serious_help");
  assert.equal(vm.issues.length, 1);
  assert.equal(vm.diffLines[0].variant, "added");
});
```

- [ ] **Step 2: Run tests and verify RED state**

Run: `npx tsx --test src/lib/roast-result-view-model.test.ts`
Expected: FAIL because mapper does not exist.

- [ ] **Step 3: Implement mapper and DB-backed result loader page**

```ts
// src/lib/roast-result-view-model.ts
export function toRoastResultViewModel(data: {
  score: string | number | null;
  verdict: string | null;
  roastQuote: string | null;
  language: string;
  lineCount: number;
  code: string;
  findings: Array<{ tone: "critical" | "warning" | "good" | "muted"; title: string; description: string }>;
  diffLines: Array<{ lineType: "context" | "removed" | "added"; content: string }>;
}) {
  return {
    score: Number(data.score ?? 0),
    verdictLabel: `verdict: ${data.verdict ?? "needs_work"}`,
    quote: data.roastQuote ?? "analysis unavailable",
    languageLabel: data.language,
    submittedLineLabel: `${data.lineCount} lines`,
    submittedCode: data.code,
    issues: data.findings.map((item) => ({
      tone: item.tone === "muted" ? "warning" : item.tone,
      label: item.tone,
      title: item.title,
      description: item.description,
    })),
    diffFileLabel: "your_code -> suggested_fix",
    diffLines: data.diffLines.map((line) => ({
      variant: line.lineType,
      code: line.content,
    })),
  };
}
```

```tsx
// src/app/result/[roastId]/page.tsx (core data switch)
import { getRoastResultBySubmissionId } from "@/db/queries/roasts";
import { toRoastResultViewModel } from "@/lib/roast-result-view-model";

async function getRoastResultOrNull(roastId: string) {
  if (/^\d+$/.test(roastId)) {
    return null;
  }

  return getRoastResultBySubmissionId(roastId);
}

const result = await getRoastResultOrNull(roastId);
if (!result || result.status !== "completed") {
  notFound();
}

const roast = toRoastResultViewModel(result);
```

- [ ] **Step 4: Re-run tests and verify GREEN state**

Run: `npx tsx --test src/lib/roast-result-view-model.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit result-page real data migration**

```bash
git add src/lib/roast-result-view-model.ts src/lib/roast-result-view-model.test.ts src/app/result/[roastId]/page.tsx
git commit -m "feat(result): render persisted roast analysis instead of static fixture"
```

### Task 5: End-to-End Verification and Documentation

**Files:**
- Modify: `README.md`
- Modify: `.env.example`

- [ ] **Step 1: Add env documentation for roast AI provider setup**

```md
## AI roast setup

Add to `.env`:

OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

- [ ] **Step 2: Run full test suite and keep RED/GREEN confidence**

Run: `npx tsx --test src/lib/roast-analyzer.test.ts src/trpc/routers/roast.test.ts src/lib/roast-result-view-model.test.ts src/components/home/home-page-client.submit-label.test.ts`
Expected: PASS all tests.

- [ ] **Step 3: Run static validation commands**

Run: `npm run lint && npm run build`
Expected: both commands exit `0`.

- [ ] **Step 4: Manual acceptance checklist in dev**

Run: `npm run dev`

Verify:
- Home submit disables button and shows `$ roasting...` while request is active.
- `roastMode` toggle changes payload between `maximum` and `normal`.
- Success redirects to `/result/[uuid]` and renders real DB-backed analysis.
- Forced provider failure shows inline error on home without redirect.
- `/roast/[roastId]` still redirects to `/result/[roastId]`.

- [ ] **Step 5: Commit docs and final verification state**

```bash
git add README.md .env.example
git commit -m "docs(roast): document ai env configuration and verification steps"
```

## Self-Review Notes

- **Spec coverage:** mutation flow, roast mode support, synchronous analysis, inline home error behavior, real result rendering, and no share implementation are all covered.
- **Placeholder scan:** no TODO/TBD/incomplete implementation statements remain.
- **Type consistency:** `roastMode`, verdict/tone enums, and transition statuses are consistent with database enums and route usage.
