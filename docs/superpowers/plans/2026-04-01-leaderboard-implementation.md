# Dynamic Leaderboard Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/leaderboard` static data with real tRPC + DB data, rendering top 20 entries with homepage-style collapsible code rows and real stats.

**Architecture:** Extend DB query helpers to provide full leaderboard rows and aggregated stats for `completed + public` records, then expose a new `leaderboard.full` tRPC procedure that returns `{ entries, stats }` in one query flow. Update the leaderboard page server component to fetch this procedure and render rows using `HomepageLeaderboardRow` + `CodeBlock` collapsed/expanded views.

**Tech Stack:** Next.js App Router, TypeScript, tRPC v11 (`@trpc/tanstack-react-query`), Drizzle ORM, Base UI Collapsible, Shiki-backed `CodeBlock`, Biome.

---

### Task 1: Extend DB Queries for Full Leaderboard Payload

**Files:**
- Modify: `src/db/queries/roasts.ts`

- [ ] **Step 1: Add failing type-level contract for new query return shape (local compile target)**

```ts
// Add near bottom of roasts.ts to force explicit row shape while coding
type FullLeaderboardRow = {
  submissionId: string;
  roastResultId: string;
  score: number;
  language: string;
  lineCount: number;
  codePreview: string;
  code: string;
  createdAt: Date;
};
```

- [ ] **Step 2: Update leaderboard list query to include full code**

```ts
export async function listLeaderboard(limit = 20, offset = 0) {
  return db
    .select({
      submissionId: leaderboardEntries.submissionId,
      roastResultId: leaderboardEntries.roastResultId,
      score: leaderboardEntries.score,
      language: leaderboardEntries.language,
      lineCount: leaderboardEntries.lineCount,
      codePreview: leaderboardEntries.codePreview,
      code: submissions.code,
      createdAt: leaderboardEntries.createdAt,
    })
    .from(leaderboardEntries)
    .innerJoin(submissions, eq(leaderboardEntries.submissionId, submissions.id))
    .orderBy(asc(leaderboardEntries.score), asc(leaderboardEntries.createdAt))
    .limit(limit)
    .offset(offset);
}
```

- [ ] **Step 3: Add stats query for completed/public dataset**

```ts
import { and, asc, eq, sql } from "drizzle-orm";

export async function getLeaderboardStats() {
  const [stats] = await db
    .select({
      totalSubmissions: sql<number>`count(*)::int`,
      averageScore:
        sql<number>`coalesce(round(avg(${roastResults.score})::numeric, 1), 0)::float8`,
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
    totalSubmissions: stats?.totalSubmissions ?? 0,
    averageScore: stats?.averageScore ?? 0,
  };
}
```

- [ ] **Step 4: Run static checks for this file**

Run: `pnpm lint`
Expected: no Biome errors from `src/db/queries/roasts.ts`.

- [ ] **Step 5: Commit DB query changes**

```bash
git add src/db/queries/roasts.ts
git commit -m "feat(db): include leaderboard code and aggregate stats"
```

### Task 2: Add `leaderboard.full` tRPC Procedure

**Files:**
- Modify: `src/trpc/routers/leaderboard.ts`

- [ ] **Step 1: Write failing contract usage by adding procedure call shape**

```ts
// Target response shape while implementing
type FullLeaderboardResponse = {
  entries: Array<{
    rank: string;
    score: number;
    scoreTone: ScoreTone;
    language: string;
    lineCount: number;
    codePreview: string;
    code: string;
  }>;
  stats: {
    totalSubmissions: number;
    averageScore: number;
  };
};
```

- [ ] **Step 2: Import new query helpers and implement procedure**

```ts
import { getLeaderboardStats, listLeaderboard, listHomepageLeaderboardTop } from "@/db/queries/roasts";

export const leaderboardRouter = createTRPCRouter({
  homepageTop: publicProcedure.query(async () => {
    // keep existing behavior
  }),
  full: publicProcedure.query(async () => {
    const [rows, stats] = await Promise.all([
      listLeaderboard(20, 0),
      getLeaderboardStats(),
    ]);

    const entries = rows.map((row, index) => {
      const scoreNumber = Number(row.score ?? 0);

      return {
        rank: `#${index + 1}`,
        score: scoreNumber,
        scoreTone: getScoreTone(scoreNumber),
        language: row.language,
        lineCount: row.lineCount,
        codePreview: row.codePreview,
        code: row.code,
      };
    });

    return {
      entries,
      stats,
    };
  }),
});
```

- [ ] **Step 3: Ensure homepageTop remains unchanged in API behavior**

```ts
// Keep homepageTop return fields identical to current consumer needs:
// { code, codePreview, language, rank, score, scoreTone }
```

- [ ] **Step 4: Run static and build checks for router integration**

Run: `pnpm lint && pnpm build`
Expected: route handler and router types compile without errors.

- [ ] **Step 5: Commit router changes**

```bash
git add src/trpc/routers/leaderboard.ts
git commit -m "feat(trpc): add full leaderboard query for top 20 page"
```

### Task 3: Replace Static `/leaderboard` with Server tRPC Data

**Files:**
- Modify: `src/app/leaderboard/page.tsx`
- Reuse: `src/components/home/homepage-leaderboard-row.tsx`

- [ ] **Step 1: Remove static data imports and switch page to async server fetch**

```ts
import { HomepageLeaderboardRow } from "@/components/home/homepage-leaderboard-row";
import { getQueryClient, trpc } from "@/trpc/server";

export default async function LeaderboardPage() {
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(trpc.leaderboard.full.queryOptions());
  const entries = data.entries;
```

- [ ] **Step 2: Render real stats in header**

```tsx
<div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
  <span>{data.stats.totalSubmissions.toLocaleString()} submissions</span>
  <span>&middot;</span>
  <span>avg score: {data.stats.averageScore.toFixed(1)}</span>
</div>
```

- [ ] **Step 3: Render 20 rows with homepage collapsible behavior**

```tsx
<section className="flex w-full flex-col gap-5">
  {entries.map((entry) => (
    <HomepageLeaderboardRow
      key={entry.rank}
      rank={entry.rank}
      score={entry.score}
      scoreTone={entry.scoreTone}
      language={entry.language}
      codePreview={entry.codePreview}
      collapsedCodeBlock={
        <CodeBlock
          className="border-0"
          code={entry.code.split("\n").slice(0, 3).join("\n")}
          lang={toShikiLanguage(entry.language)}
        />
      }
      expandedCodeBlock={
        <CodeBlock
          className="border-0"
          code={entry.code}
          lang={toShikiLanguage(entry.language)}
        />
      }
    />
  ))}
</section>
```

- [ ] **Step 4: Add empty-state message and update footer count**

```tsx
{entries.length === 0 ? (
  <div className="border border-border-primary p-4 font-mono text-xs text-text-tertiary">
    // no public completed roasts yet
  </div>
) : null}

<span>showing top {entries.length}</span>
```

- [ ] **Step 5: Commit leaderboard page migration**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat(leaderboard): load top 20 rows and stats from trpc"
```

### Task 4: Final Verification and Cleanup

**Files:**
- Optional cleanup decision: `src/lib/leaderboard-static.ts` (only if unused)

- [ ] **Step 1: Check whether static leaderboard file is still referenced**

Run: `rg "leaderboard-static" src`
Expected: no results (or only intentional references).

- [ ] **Step 2: If unused, delete static fixture file**

```bash
git rm src/lib/leaderboard-static.ts
```

If still used, keep the file and skip deletion.

- [ ] **Step 3: Run full verification suite**

Run: `pnpm lint && pnpm build`
Expected: both commands succeed.

- [ ] **Step 4: Manual verification in dev server**

Run: `pnpm dev`

Manual checks:
- Open `http://localhost:3000/leaderboard`
- Confirm 20 rows max, no pagination
- Confirm header metrics are non-static DB values
- Expand/collapse multiple rows and validate syntax highlight
- Confirm unknown languages still render without crashing (plaintext fallback)

- [ ] **Step 5: Commit final cleanup and verification state**

```bash
git add src/lib/leaderboard-static.ts src/app/leaderboard/page.tsx src/trpc/routers/leaderboard.ts src/db/queries/roasts.ts
git commit -m "chore(leaderboard): remove static fixtures and verify dynamic page"
```

## Self-Review Notes

- Spec coverage check: all approved requirements are mapped to tasks (top 20, collapsible behavior, real DB metrics, shared filters).
- Placeholder scan: no TODO/TBD markers in executable steps.
- Type consistency: `entries` and `stats` names are consistent across DB query, router, and page usage.
