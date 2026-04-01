# Project Standards

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4 (`@theme` tokens)
- Biome for lint/format
- tRPC v11 + TanStack React Query for typed API access

## UI Rules
- Prefer composition pattern (`ComponentRoot`, `ComponentPart`) over prop-heavy APIs.
- Use named exports only; never default exports for shared UI.
- Reuse existing UI components and theme tokens before creating new styles.
- Use Tailwind token classes (e.g. `bg-bg-page`, `text-text-primary`) instead of raw CSS variables in components.

## App Rules
- Keep navbar shared in `layout.tsx`.
- Keep homepage and showcase data static unless a task explicitly asks for API integration.
- For interactive behavior, use `base-ui` primitives.
- Keep `CodeBlock` server-only; use `CodeEditor` for client-side editing.

## API Rules (tRPC)
- Use `@trpc/tanstack-react-query` for App Router integration (do not use `@trpc/next`).
- Keep tRPC entrypoint at `src/app/api/trpc/[trpc]/route.ts` using `fetchRequestHandler`.
- Keep shared tRPC setup in `src/trpc/*` (`init`, `query-client`, `server`, `client`, `routers`).
- Validate input with Zod in procedures whenever there is external input.

## Homepage Metrics Rules
- Homepage metrics are fetched via tRPC `metrics.homepage`.
- For this metrics block specifically, do not use Suspense/skeleton loading.
- Render metrics with initial value `0`, then update to API values to drive Number Flow animation.
- Use `@number-flow/react` for numeric transitions in this block.

## Routing Compatibility
- Keep compatibility route `/roast/[roastId]` redirecting to `/result/[roastId]`.
- Result page must accept both UUID and numeric roast IDs.
