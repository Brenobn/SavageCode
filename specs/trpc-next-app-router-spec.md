# Especificacao - tRPC como camada de API no Next.js (App Router + SSR/RSC)

## Contexto

Hoje o projeto esta frontend-first e ja possui dados/queries no backend via Drizzle (`src/db/queries/roasts.ts`), mas sem uma camada de API tipada para consumo do app.

Objetivo: adotar tRPC v11 com TanStack React Query como camada oficial de API/back-end, com integracao nativa ao Next.js App Router, incluindo prefetch em Server Components e hidratacao para Client Components.

## Base tecnica (Context7)

Referencias usadas:

- tRPC docs: `/websites/trpc_io`
  - Setup App Router: `client/nextjs/app-router-setup`
  - Setup TanStack: `client/tanstack-react-query/setup`
  - Server Components: `client/tanstack-react-query/server-components`

Decisoes baseadas na doc:

- Usar `@trpc/tanstack-react-query` (nao `@trpc/next`).
- Expor handler em `src/app/api/trpc/[trpc]/route.ts` com `fetchRequestHandler`.
- Criar proxy server-side com `createTRPCOptionsProxy` e `cache(makeQueryClient)` para request-scoped query client.
- Fazer prefetch no Server Component + `HydrationBoundary`/`dehydrate` para hidratar no client.

## Escopo

In scope:

- Setup base tRPC no projeto Next.js App Router.
- Integracao com React Query para client e server.
- Definicao do `appRouter` com procedimentos iniciais para roast e leaderboard.
- Padrao oficial para uso em Server Components (prefetch SSR) e Client Components (`useQuery`).
- Tratamento de erro e validacao de input com Zod.

Out of scope:

- Autenticacao/autorizacao completa.
- Filas/background workers para processamento de roast.
- Migracao total de todas as telas para dados dinamicos em uma unica entrega.

## Requisitos

Funcionais:

- API deve expor procedimentos tipados para:
  - `roast.createSubmission`
  - `roast.getBySubmissionId`
  - `leaderboard.list`
  - `health.ping`
- Inputs devem ser validados com Zod.
- Erros devem retornar shape consistente para UI (codigo + mensagem).

Tecnicos:

- Dependencias obrigatorias:
  - `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`
  - `@tanstack/react-query`
  - `zod`
  - `superjson`
- Estrutura de arquivos proposta:
  - `src/trpc/init.ts`
  - `src/trpc/query-client.ts`
  - `src/trpc/server.tsx`
  - `src/trpc/client.tsx`
  - `src/trpc/routers/_app.ts`
  - `src/trpc/routers/health.ts`
  - `src/trpc/routers/roast.ts`
  - `src/trpc/routers/leaderboard.ts`
  - `src/app/api/trpc/[trpc]/route.ts`
- `init.ts` deve conter:
  - `createTRPCContext` (base para headers/request metadata)
  - `initTRPC.context<...>().create({ transformer: superjson })`
  - exports de `router` e `publicProcedure`
- `query-client.ts` deve criar `makeQueryClient()` com defaults conservadores (`staleTime`, sem retry agressivo em SSR).
- `server.tsx` deve ser `server-only` e usar `createTRPCOptionsProxy` + `cache(makeQueryClient)`.
- `client.tsx` deve usar `createTRPCContext<AppRouter>()` e provider em `layout.tsx`.
- `route.ts` deve usar `fetchRequestHandler` com endpoint `/api/trpc`.
- Uso em RSC deve seguir padrao:
  - Server Component: `prefetchQuery(trpc.xyz.queryOptions(...))`
  - `HydrationBoundary state={dehydrate(queryClient)}`
  - Client Component: `useTRPC()` + `useQuery(trpc.xyz.queryOptions(...))`
- Manter padroes do projeto:
  - App Router + TypeScript
  - Navbar continua em `src/app/layout.tsx`
  - named exports para modulos compartilhados

## Criterios de aceite

- `pnpm dev` sobe sem erro com tRPC configurado.
- Endpoint `POST /api/trpc/health.ping` responde com sucesso.
- Um Server Component consegue prefetch de `leaderboard.list` e renderizar com hidratacao sem waterfall extra no client.
- Um Client Component consegue consumir `roast.getBySubmissionId` via `useQuery` com tipos inferidos de ponta a ponta.
- Erro de input invalido (ex.: `submissionId` mal formatado) retorna erro tRPC padronizado e tratavel na UI.
- `pnpm lint` passa sem violacoes.

## Plano de implementacao

- [ ] Instalar dependencias tRPC + React Query + Zod + SuperJSON.
- [ ] Criar `src/trpc/init.ts` com contexto, transformer e procedimentos base.
- [ ] Criar `src/trpc/routers/*` e compor em `src/trpc/routers/_app.ts`.
- [ ] Implementar `src/app/api/trpc/[trpc]/route.ts` com `fetchRequestHandler`.
- [ ] Criar `src/trpc/query-client.ts` com factory de QueryClient.
- [ ] Criar `src/trpc/client.tsx` (provider client-side).
- [ ] Integrar provider no `src/app/layout.tsx` sem remover navbar compartilhada.
- [ ] Criar `src/trpc/server.tsx` para consumo em Server Components (proxy + query client cacheado).
- [ ] Implementar um exemplo real de prefetch/hidratacao (ex.: leaderboard na homepage).
- [ ] Implementar um exemplo real de query client-side (ex.: resultado por `submissionId`).
- [ ] Validar `pnpm lint` e smoke test manual de rotas/procedures.
