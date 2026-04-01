# tRPC Standards

Use this directory for all tRPC integration and shared API client/server setup.

## Integration Pattern

- Next.js App Router only.
- Use `@trpc/tanstack-react-query` (never `@trpc/next`).
- Keep route handler at `src/app/api/trpc/[trpc]/route.ts` with `fetchRequestHandler`.

## File Responsibilities

- `init.ts`: `createTRPCContext`, `createTRPCRouter`, `publicProcedure`, error formatting.
- `query-client.ts`: `makeQueryClient()` defaults for React Query.
- `client.tsx`: React provider + browser query client singleton.
- `server.ts`: server-only helpers for server-side query execution.
- `routers/*`: domain routers only; keep each router focused.

## Procedure Rules

- Use Zod for any external input.
- Return serializable plain objects from procedures.
- Keep database access in procedure handlers small and explicit.
- Add new procedures only when consumed by a feature scope.

## Scope Guardrail (Current Phase)

- Active endpoint in this phase: `metrics.homepage`.
- Do not add `roast.*` or `leaderboard.*` tRPC procedures unless requested.
