# Especificacao - Drizzle ORM + Postgres com Docker Compose

## Contexto

Com base no `README.md` e no layout atual do Pencil (`C:\Users\DELL\Downloads\devroast.pen`), o produto hoje e frontend-first e ja explicita estes fluxos:

- Screen 1 (Code Input): envio de codigo, toggle `roast mode`, CTA de envio e preview de leaderboard.
- Screen 2 (Roast Results): score geral, veredito, quote de roast, metadados de linguagem/linhas, cards de analise e diff sugerido.
- Screen 3 (Shame Leaderboard): ranking publico por score pior (mais baixo), com snippet e metadados.
- Screen 4 (OG Image): material de compartilhamento do roast.

Objetivo desta spec: definir o modelo de dados e o plano de implementacao com Drizzle ORM para suportar esses fluxos em Postgres local via Docker Compose.

## Base tecnica (Context7)

Referencias usadas:

- Drizzle docs: `/drizzle-team/drizzle-orm-docs`
  - install: `drizzle-orm`, `postgres`, `drizzle-kit`
  - config: `drizzle.config.ts` com `dialect: "postgresql"`
  - migracoes: `npx drizzle-kit migrate`
- Docker Compose docs: `/docker/compose`
  - servico `postgres` com volume, `environment`, `ports`, `healthcheck`
  - ciclo de vida: `docker compose up -d`, `docker compose down`, `docker compose down -v`

## Escopo funcional de dados (V1)

Persistir:

- Submissoes de codigo (entrada do usuario).
- Resultado consolidado do roast por submissao.
- Achados da analise (cards critical/warning/good).
- Linhas de diff sugerido (removed/added/context).
- Dados para leaderboard (derivados do resultado + submissao).

Fora de escopo V1:

- Conta de usuario e autenticacao.
- Billing/plano.
- Versionamento de prompts complexo.

## Enums propostos

### `roast_mode`

- `normal`
- `maximum`

Origem: toggle da homepage (`roast mode` + texto `maximum sarcasm enabled`).

### `analysis_status`

- `pending`
- `processing`
- `completed`
- `failed`

Necessario para pipeline assincrono (submit agora, processar e preencher resultado).

### `analysis_tone`

- `critical`
- `warning`
- `good`
- `muted`

Origem: componentes visuais (`StatusBadge`, `TableRowScore`) e cards de analise.

### `diff_line_type`

- `context`
- `removed`
- `added`

Origem: bloco `suggested_fix` da Screen 2.

### `submission_visibility`

- `public`
- `unlisted`
- `private`

Necessario para controlar entrada no leaderboard sem apagar historico.

### `code_language`

Enum inicial recomendado (curado para UX/layout atual):

- `javascript`, `typescript`, `sql`, `java`, `python`, `bash`, `go`, `rust`, `csharp`, `cpp`, `php`, `ruby`, `unknown`

Observacao: pode virar `text` no futuro se quisermos lista totalmente dinamica.

### `roast_verdict`

- `needs_serious_help`
- `needs_work`
- `decent`
- `clean`

Origem: badge/veredito mostrado no resultado e OG image.

## Tabelas propostas

## 1) `submissions`

Representa o input original do usuario.

Campos sugeridos:

- `id` uuid pk
- `code` text not null
- `language` `code_language` not null default `unknown`
- `line_count` integer not null
- `roast_mode` `roast_mode` not null default `normal`
- `visibility` `submission_visibility` not null default `public`
- `fingerprint` text null (hash para dedupe/fraude opcional)
- `created_at` timestamp with time zone not null default now
- `updated_at` timestamp with time zone not null default now

Indices:

- idx `submissions_created_at_idx` (`created_at` desc)
- idx `submissions_language_idx` (`language`)

## 2) `roast_results`

Representa o resultado consolidado de uma submissao.

Campos sugeridos:

- `id` uuid pk
- `submission_id` uuid not null unique fk -> `submissions.id` on delete cascade
- `status` `analysis_status` not null default `pending`
- `score` numeric(3,1) null
- `verdict` `roast_verdict` null
- `roast_quote` text null
- `model` text null (ex: modelo usado no backend)
- `error_message` text null
- `completed_at` timestamp with time zone null
- `created_at` timestamp with time zone not null default now
- `updated_at` timestamp with time zone not null default now

Constraints:

- check score entre 0.0 e 10.0
- se `status = completed`, `score` e `verdict` devem estar preenchidos

Indices:

- idx `roast_results_status_created_at_idx` (`status`, `created_at` desc)
- idx `roast_results_score_idx` (`score` asc) para leaderboard

## 3) `analysis_findings`

Cards detalhados da secao `detailed_analysis`.

Campos sugeridos:

- `id` uuid pk
- `roast_result_id` uuid not null fk -> `roast_results.id` on delete cascade
- `position` integer not null
- `tone` `analysis_tone` not null
- `title` text not null
- `description` text not null
- `created_at` timestamp with time zone not null default now

Constraints e indices:

- unique `analysis_findings_result_position_uk` (`roast_result_id`, `position`)
- idx `analysis_findings_result_idx` (`roast_result_id`)

## 4) `suggested_diff_lines`

Linhas de diff mostradas na secao `suggested_fix`.

Campos sugeridos:

- `id` uuid pk
- `roast_result_id` uuid not null fk -> `roast_results.id` on delete cascade
- `position` integer not null
- `line_type` `diff_line_type` not null
- `content` text not null
- `created_at` timestamp with time zone not null default now

Constraints e indices:

- unique `suggested_diff_lines_result_position_uk` (`roast_result_id`, `position`)
- idx `suggested_diff_lines_result_idx` (`roast_result_id`)

## 5) `leaderboard_entries` (view materializada ou view)

Recomendacao V1: comecar como `VIEW` (sem tabela fisica), derivada de `submissions` + `roast_results`.

Campos projetados:

- `submission_id`
- `roast_result_id`
- `score`
- `language`
- `line_count`
- `code_preview` (substring do codigo, ex: primeiros 120 chars)
- `created_at`

Regra:

- incluir apenas `status = completed` e `visibility = public`.

Ordenacao padrao:

- `score` asc, depois `created_at` asc.

## Relacionamentos

- `submissions` 1:1 `roast_results`
- `roast_results` 1:N `analysis_findings`
- `roast_results` 1:N `suggested_diff_lines`

## Mapeamento com telas atuais

- Screen 1 (input): grava em `submissions`; cria `roast_results` com `pending`.
- Screen 2 (results): le `roast_results`, `analysis_findings`, `suggested_diff_lines` por `submission_id`.
- Screen 3 (leaderboard): consulta view `leaderboard_entries` paginada.
- Screen 4 (og image): usa `roast_results.verdict`, `roast_results.score`, `submissions.language`, `submissions.line_count`, `roast_results.roast_quote`.

## Estrutura tecnica recomendada (Drizzle)

Arquivos sugeridos:

- `drizzle.config.ts`
- `src/db/schema/enums.ts`
- `src/db/schema/submissions.ts`
- `src/db/schema/roast-results.ts`
- `src/db/schema/analysis-findings.ts`
- `src/db/schema/suggested-diff-lines.ts`
- `src/db/schema/index.ts`
- `src/db/client.ts`
- `drizzle/` (SQL gerado)

Padrao de schema:

- `pgEnum` para enums acima.
- `pgTable` para tabelas.
- `relations` para relacionamento (queries relacionais tipadas).

## Docker Compose (Postgres local)

Criar `docker-compose.yml` com um servico `postgres`:

- imagem `postgres:15` (ou 16, mantendo consistencia no time)
- porta `5432:5432`
- variaveis: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- volume nomeado para persistencia
- `healthcheck` com `pg_isready -U <user>`

Fluxo de uso local:

- subir: `docker compose up -d --wait`
- derrubar: `docker compose down`
- limpar volume (quando necessario): `docker compose down -v`

## Variaveis de ambiente

`.env.example` recomendado:

- `DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast`

Opcional:

- `DATABASE_URL_TEST=postgresql://devroast:devroast@localhost:5433/devroast_test`

## Scripts NPM sugeridos

- `db:up`: `docker compose up -d --wait`
- `db:down`: `docker compose down`
- `db:down:volumes`: `docker compose down -v`
- `db:generate`: `drizzle-kit generate`
- `db:migrate`: `drizzle-kit migrate`
- `db:studio`: `drizzle-kit studio`

## Plano de implementacao (to-dos)

- [ ] Adicionar dependencias: `drizzle-orm`, `postgres`, `drizzle-kit`.
- [ ] Criar `docker-compose.yml` com Postgres + volume + healthcheck.
- [ ] Criar `.env.example` com `DATABASE_URL`.
- [ ] Criar `drizzle.config.ts` apontando para `src/db/schema/index.ts`.
- [ ] Implementar enums em `src/db/schema/enums.ts`.
- [ ] Implementar tabelas e relacoes em `src/db/schema/*`.
- [ ] Gerar primeira migration SQL (`drizzle-kit generate`).
- [ ] Aplicar migration no banco local (`drizzle-kit migrate`).
- [ ] Criar `src/db/client.ts` com singleton de conexao para ambiente Next.
- [ ] Criar seeds minimos com dados de exemplo do layout (scores, cards, diffs, leaderboard).
- [ ] Expor repositorio/funcoes de leitura para homepage e leaderboard (mantendo frontend estatico por feature flag, se necessario).
- [ ] Documentar comandos no README apos merge.

## Criterios de aceite

- Banco sobe localmente com um unico comando.
- Migration inicial cria todas as tabelas/enums sem ajuste manual.
- E possivel inserir uma submissao e materializar um resultado completo (score + cards + diff).
- Leaderboard retorna ranking ordenado por pior score.
- Tipagem Drizzle cobre selects/inserts principais sem `any`.

## Riscos e mitigacoes

- Divergencia entre enum de linguagem e linguagens reais da UI:
  - mitigacao: incluir `unknown` e mapear no backend antes de persistir.
- Crescimento de `code` (payload grande):
  - mitigacao: limite de tamanho no endpoint e sanitizacao de entrada.
- Leaderboard pesado com alto volume:
  - mitigacao: indice por score, paginacao cursor-based e opcao de materialized view depois.

## Perguntas em aberto

1. Queremos manter leaderboard 100% anonimo na V1 ou incluir `author_name` opcional na submissao?
2. O corte para entrar no leaderboard sera por top N global, janela temporal (ex: ultimos 30 dias) ou ambos?
3. A visibilidade padrao deve ser `public` ou `unlisted` para reduzir exposicao automatica de codigo?
