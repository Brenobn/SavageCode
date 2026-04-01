# Design Spec: Dynamic Leaderboard Page (Top 20)

Date: 2026-04-01
Status: Approved for planning
Scope: Implement dynamic `/leaderboard` using tRPC + database data, matching homepage leaderboard interaction patterns.

## 1. Goal

Replace the static leaderboard page implementation with a database-backed tRPC flow that:

- Renders the top 20 leaderboard entries (no pagination)
- Uses the same collapsible interaction model from homepage leaderboard rows
- Uses syntax-highlighted code blocks for collapsed and expanded states
- Shows real stats from database (`submissions` and `avg score`) using the same filter criteria as the list

## 2. User-Confirmed Requirements

1. Keep behavior aligned with homepage shame leaderboard, including collapsible code row UX.
2. Render 20 results on `/leaderboard` without pagination.
3. Replace static metrics with real database values.
4. Metrics and list must use the same filter logic:
   - Roast status: `completed`
   - Submission visibility: `public`

## 3. Current Context

- Homepage leaderboard already uses tRPC via `leaderboard.homepageTop` and renders interactive rows with `HomepageLeaderboardRow`.
- `/leaderboard` currently uses static fixture data from `src/lib/leaderboard-static.ts`.
- Existing DB query helper `listLeaderboard(limit, offset)` returns leaderboard entries from `leaderboard_entries` but currently omits full source code.

## 4. Chosen Approach

Approach selected: **Reuse homepage row interaction pattern (Option 1)**.

Why:

- Lowest delivery risk and fastest path.
- Preserves existing UI behavior users already see on homepage.
- Avoids premature extraction/refactor while keeping future extraction possible.

## 5. Architecture

### 5.1 tRPC

Add a new procedure in `src/trpc/routers/leaderboard.ts`:

- `leaderboard.full`

Procedure returns one payload:

- `entries`: top 20 leaderboard rows with full code and display metadata
- `stats`: real aggregate metrics for the same filtered dataset

### 5.2 Database Access

Update/add query helpers in `src/db/queries/roasts.ts`:

1. **Top 20 leaderboard list**
   - Based on existing `listLeaderboard(20, 0)` behavior
   - Ensure row shape includes full `code` (needed for expanded code block)
   - Keep ordering by `score ASC`, then `createdAt ASC`

2. **Leaderboard stats**
   - New aggregate query for:
     - `totalSubmissions`: count of rows with `completed` + `public`
     - `averageScore`: average score over same filtered set

### 5.3 Frontend Page

Update `src/app/leaderboard/page.tsx` to server-fetch via tRPC:

- `getQueryClient().fetchQuery(trpc.leaderboard.full.queryOptions())`

Rendering:

- Header stats use `data.stats` from DB
- List uses `data.entries` (20 items)
- Row UI reuses `HomepageLeaderboardRow`
  - Collapsed content: first 3 lines in `CodeBlock`
  - Expanded content: full code in `CodeBlock`
- Language mapping keeps `toShikiLanguage()` fallback to `plaintext`
- Footer shows `showing top 20`

## 6. Response/Type Shape

`leaderboard.full` response contract:

- `entries: Array<{`
  - `rank: string` (`#1` to `#20`)
  - `score: number`
  - `scoreTone: "critical" | "warning" | "good" | "muted"`
  - `language: string`
  - `lineCount: number`
  - `codePreview: string`
  - `code: string`
- `}>`
- `stats: {`
  - `totalSubmissions: number`
  - `averageScore: number`
- `}`

Tone mapping stays consistent with existing logic:

- `<= 2`: `critical`
- `<= 3.8`: `warning`
- `<= 5`: `muted`
- `> 5`: `good`

## 7. Error Handling and Empty Data

- tRPC/database failures propagate through standard route error behavior (no custom masking in this scope).
- Empty state behavior:
  - `stats.totalSubmissions = 0`
  - `stats.averageScore = 0`
  - list renders no rows and includes a short empty hint in the table area.
- Unknown language still highlights as `plaintext` fallback.

## 8. Testing and Verification

Verification checklist:

1. Static checks (`biome` / type checks as configured)
2. Build (`next build` via project script)
3. Manual page verification for `/leaderboard`:
   - Shows 20 rows max, no pagination controls
   - Header metrics match real DB values
   - Row collapse/expand works
   - Collapsed uses preview (3 lines), expanded uses full code
   - Syntax highlighting works and unknown languages fall back gracefully

## 9. Out of Scope

- Pagination/infinite scroll
- New sorting/filtering controls
- Refactor of row component into global shared UI primitive
- Visual redesign beyond parity with current style tokens and layout language

## 10. Implementation Boundaries

- Follow existing App Router + tRPC integration (`@trpc/tanstack-react-query`).
- Keep server-side data fetch in page-level server component.
- Reuse existing design tokens/classes and existing reusable components.
