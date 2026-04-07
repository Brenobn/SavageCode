# Roast Creation Feature Design

## Goal

Implement the core roast creation flow so users can submit code, choose roast mode, receive AI analysis, and view the persisted result at `/result/[roastId]`.

## Scope

### In scope

- Submit code from home with roast mode selection (`normal` or `maximum`).
- Run AI analysis synchronously in a tRPC mutation.
- Persist submission, status transitions, and final roast payload in existing database tables.
- Redirect to result page only after successful analysis.
- Show inline error on home if AI analysis fails.
- Keep `/roast/[roastId]` compatibility redirect to `/result/[roastId]`.

### Out of scope

- Share roast implementation.
- Background job/queue processing.
- New social or moderation features.

## Product Decisions

- **Execution model:** synchronous AI analysis within request lifecycle.
- **UX during submit:** button/input locked and visible analyzing state.
- **Failure behavior:** no redirect; show inline error on home and allow retry.
- **Branching preference:** work directly on `main`.

## Architecture

### High-level flow

1. User clicks `$ roast_my_code` in `HomePageClient`.
2. Client calls `trpc.roast.createAndAnalyze` mutation with `code`, `language`, and `roastMode`.
3. Server validates input and creates initial records (`submission` + `roast_result` pending).
4. Server marks roast as processing.
5. Server calls AI analyzer service and gets structured analysis payload.
6. On success, server persists completed result (`score`, `verdict`, `roastQuote`, findings, diff lines).
7. Server returns `roastId`.
8. Client redirects to `/result/[roastId]`.
9. On analysis error, server marks roast as failed and returns typed error; client shows inline error and stays on home.

### Boundaries

- **UI layer:** handles form state, loading lock, and inline errors.
- **tRPC layer:** validates input and orchestrates domain workflow.
- **Domain/service layer:** encapsulates AI call and output normalization.
- **DB layer:** existing query helpers own all writes and status transitions.

## Components and File Plan

### Create

- `src/trpc/routers/roast.ts`
  - Adds `createAndAnalyze` mutation.
  - Uses Zod input validation.
  - Returns `{ roastId: string }` on success.
- `src/lib/roast-analyzer.ts`
  - Single responsibility: call LLM provider and map output to internal analysis contract.
  - Accepts `code`, `language`, `roastMode`.

### Modify

- `src/trpc/routers/_app.ts`
  - Register `roast` router.
- `src/components/home/home-page-client.tsx`
  - Hook up mutation submit flow.
  - Add submit/loading/error state behavior.
  - Preserve existing roast mode toggle visual language.
- `src/app/result/[roastId]/page.tsx`
  - Replace static fixture usage with real DB-driven result loading.
  - Keep UUID and numeric route compatibility.
- `src/db/queries/roasts.ts` (reuse existing helpers where possible)
  - Keep write APIs centralized.
  - Ensure failure path persists `errorMessage`.

## Data Flow and Contracts

### Mutation input

- `code: string` (required, non-empty, server-enforced max length).
- `language: code_language` (or normalized string mapped to enum/unknown).
- `roastMode: "normal" | "maximum"`.

### Mutation output

- Success: `{ roastId: string }`.
- Failure: typed tRPC error message suitable for direct inline display.

### Persisted transitions

- `pending` -> `processing` -> `completed` on success.
- `pending` -> `processing` -> `failed` on AI failure.

## Error Handling

- Validate all external input with Zod at mutation boundary.
- Catch provider/network/timeout failures in orchestration layer.
- Persist failed state with message before returning error.
- Surface user-friendly inline error copy in home UI.
- Keep raw provider details out of user-facing messages.

## UX Behavior

### Home page

- Submit disabled if code is empty or exceeds current limit.
- While submitting:
  - Disable button and editor interactions.
  - Show loading label (`$ roasting...`).
  - Hide stale error.
- On success: navigate to `/result/[roastId]`.
- On failure: render inline error near action area and allow immediate retry.

### Result page

- Resolve roast by route id and render persisted fields.
- If id invalid or data missing: `notFound()`.
- Keep share button as non-functional UI (no new behavior added).

## Testing Strategy

### Functional acceptance checks

- Roast mode value stored correctly in `submissions.roastMode`.
- Successful submit creates completed roast and navigates to result page.
- Failed AI call keeps user on home and shows inline error.
- Compatibility route `/roast/[roastId]` still redirects to `/result/[roastId]`.

### Technical checks

- Router-level tests for `createAndAnalyze` success/failure.
- Home UI interaction test for loading and inline error state.
- Build and lint verification across modified files.

## Risks and Mitigations

- **Long request duration due to synchronous AI:** keep robust timeout/error handling and clear loading feedback.
- **Provider response shape drift:** centralize parsing/normalization in analyzer service.
- **Partial persistence on failure:** enforce status updates in controlled workflow with existing query helpers.

## Rollout Notes

- Feature is additive and focused on core roast submission path.
- No schema redesign required for initial version.
- Future migration path to async jobs remains open by preserving clear layer boundaries.
