# DevRoast

DevRoast e um app web divertido onde voce cola codigo e recebe uma analise em tom de roast, direta e sem filtro.

## O que o app oferece
- Homepage com visual terminal para envio de trechos de codigo.
- Toggle de roast mode para aumentar o nivel de sarcasmo.
- Preview de shame leaderboard com exemplos de codigo "pior ranqueado".
- Sistema de componentes reutilizaveis com visual consistente.

## Estilo do produto
- Foco em developers, com estetica terminal escura.
- Feedback rapido e interface voltada para leitura de codigo.
- Mistura de humor com sinais praticos de qualidade de codigo.

## Estado atual
- Implementacao frontend-first.
- Dados estaticos na homepage e na vitrine de componentes.
- Estrutura pronta para futura integracao com API.

## Rodando localmente
```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Depois, abra `http://localhost:3000`.

## Banco de dados (Drizzle + Postgres)

Comandos uteis:

```bash
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
pnpm db:down
```

Use `.env.example` como base para criar seu `.env` com `DATABASE_URL`.
