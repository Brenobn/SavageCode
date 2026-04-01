# Home Components Standards

These rules apply to homepage-specific components in this folder.

## Responsibility Split

- Keep interactive editor UI in client component (`home-page-client.tsx`).
- Keep homepage metrics widget isolated in `homepage-metrics.tsx`.
- Prefer passing composable slots/children from page-level entry to avoid prop bloat.

## Metrics Loading Pattern (Mandatory)

- Fetch metrics with tRPC hook from client (`useQuery` + `useTRPC`).
- Do not use Suspense or skeleton for the metrics block.
- Start metric values at `0` and update after API response.
- Use `@number-flow/react` so values animate from `0` to loaded value.

## Visual Consistency

- Use existing token classes (`text-text-*`, `bg-bg-*`, `border-border-*`).
- Preserve current typography and spacing rhythm from homepage.
- Keep leaderboard preview static unless explicitly requested otherwise.
