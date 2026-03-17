# Project Standards

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4 (`@theme` tokens)
- Biome for lint/format

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
