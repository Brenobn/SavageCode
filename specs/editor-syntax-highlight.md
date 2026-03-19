# Especificacao - Editor com syntax highlight e deteccao automatica de linguagem

## Contexto

Hoje o projeto ja possui:

- `CodeEditor` client-side simples com `textarea` sem highlight (`src/components/ui/code-editor.tsx`).
- `CodeBlock` server-side com Shiki para render estatico (`src/components/ui/code-block.tsx`).

Objetivo desta feature: permitir que, ao colar/editar codigo na homepage, o editor aplique syntax highlight automaticamente com deteccao de linguagem, mantendo opcao de selecao manual pelo usuario.

## Pesquisa das opcoes

### Opcao A (recomendada): arquitetura estilo ray.so (textarea + camada highlighted)

Resumo:

- Editor continua sendo um `textarea` (boa acessibilidade e controle de input).
- Uma camada visual por baixo/por cima renderiza HTML highlighted.
- Deteccao automatica via `highlight.js` (`highlightAuto(code, languageSubset)`).
- Highlight visual via Shiki no client, com carregamento lazy de linguagens.

Como o ray.so implementa (estudo de codigo):

- Deteccao automatica em `store/code.ts` usando `hljs.highlightAuto(input, Object.keys(LANGUAGES))`.
- Selecao manual + auto em `LanguageControl.tsx` (item `Auto-Detect` e override manual).
- Highlight em `HighlightedCode.tsx` com highlighter Shiki e `codeToHtml`.
- Carregamento inicial do highlighter em `code.tsx` com temas e linguagens-base; linguagens extras sob demanda.

Por que encaixa bem neste projeto:

- O repositorio ja usa Shiki.
- Menor risco de bundle e complexidade do que Monaco.
- Mantem UX simples e focada em colar codigo para roast, sem virar IDE completa.

Trade-offs:

- Requer sincronizacao visual fina entre `textarea` e camada highlighted (scroll, fonte, line-height).
- Auto-detect nao e perfeito para snippets muito curtos/ambiguos.

### Opcao B: CodeMirror 6

Resumo:

- Editor robusto e extensivel (extensions, compartments, reconfig em runtime).
- Highlight e linguagem nativos do ecossistema CM6.

Pros:

- Excelente base para evoluir para recursos de editor avancado.
- Arquitetura moderna e modular.

Contras:

- Integracao mais trabalhosa para casar com visual atual.
- Auto-detect ainda precisa de heuristica externa ou camada adicional.
- Pode ser overkill para o caso principal (colar + roast).

### Opcao C: Monaco Editor

Resumo:

- Editor tipo VS Code no browser.

Pros:

- Feature set muito rico (ecosistema forte).

Contras:

- Peso maior de bundle/workers e setup mais complexo para Next.
- Complexidade desnecessaria para fluxo da homepage atual.

## Fontes usadas

- Ray.so (repositorio): arquitetura real do editor e deteccao.
- Shiki docs (Context7, `/shikijs/shiki`): `createHighlighterCore`/`codeToHtml`, temas e linguagens.
- CodeMirror docs (Context7, `/websites/codemirror_net`): setup por extensoes e reconfig.
- Monaco docs (Context7, `/microsoft/monaco-editor`): setup com workers e consideracoes de bundling.
- Highlight.js API docs: `highlightAuto` com `languageSubset`.

## Decisao recomendada

Seguir com **Opcao A (estilo ray.so)**:

1. Deteccao: `highlight.js` para sugerir linguagem automaticamente.
2. Render highlighted: Shiki no client para qualidade visual superior.
3. Override manual: seletor de linguagem com item `Auto`.
4. Fallback seguro: `plaintext` quando confianca baixa ou linguagem nao suportada.

Decisao de produto definida:

- Priorizar auto-deteccao e highlight para linguagens populares de **Web + Backend** na V1.

## Especificacao funcional

### Requisitos

- Ao colar ou digitar codigo, o editor deve aplicar highlight automaticamente.
- O sistema deve tentar detectar linguagem sem acao manual.
- O usuario deve poder forcar uma linguagem especifica.
- Deve existir opcao para voltar ao modo automatico.
- Se deteccao falhar, usar `plaintext` sem quebrar UX.

### Escopo inicial de linguagens (V1)

Foco em linguagens populares para Web + Backend:

- JavaScript
- TypeScript
- TSX
- JSX
- HTML
- CSS
- JSON
- SQL
- Bash/Shell
- Python
- Java
- Go
- PHP
- Ruby
- C#
- Rust
- YAML
- Markdown
- Dockerfile
- Plaintext (fallback)

Observacao:

- A deteccao automatica deve restringir o conjunto para este escopo inicial, reduzindo ambiguidade e melhorando acuracia.

### Comportamento de deteccao

- Disparar deteccao com debounce curto (ex.: 200-300ms) apos mudanca no codigo.
- Restringir deteccao a linguagens oficialmente suportadas no produto.
- Se trecho for muito curto/ambiguo, manter linguagem atual ou cair para `plaintext`.
- Quando usuario escolhe manualmente uma linguagem, pausar auto-detect ate ele voltar para `Auto`.

### Comportamento visual

- Preservar layout atual do `CodeEditor` (janela terminal + linhas).
- Highlight deve respeitar tokens de tema do projeto.
- Scroll e line numbers devem permanecer alinhados entre texto editavel e camada highlighted.

## Especificacao tecnica proposta

### Estrategia de componentes

- Evoluir `src/components/ui/code-editor.tsx` para composicao com duas camadas:
  - camada input (`textarea`)
  - camada render (`pre/code` com HTML do Shiki)
- Adicionar controle de linguagem na homepage com opcao `Auto` + lista de linguagens.

Sugestao de estrutura (nomes referenciais):

- `src/components/ui/code-editor.tsx` (container e input)
- `src/components/ui/code-editor-highlight.tsx` (render highlighted)
- `src/components/ui/code-language-select.tsx` (combobox/select)
- `src/lib/code-languages.ts` (mapa de linguagens suportadas)
- `src/lib/code-language-detect.ts` (heuristica e adaptador do highlight.js)

### Estado

- `code: string`
- `languageMode: "auto" | "manual"`
- `manualLanguage: string | null`
- `detectedLanguage: string | null`
- `effectiveLanguage: string` (manual ou detectada ou plaintext)

### Pipeline de highlight

1. Usuario altera texto.
2. Debounce dispara deteccao (se `languageMode = auto`).
3. Resolver `effectiveLanguage`.
4. Shiki gera HTML highlighted para `effectiveLanguage`.
5. Camada visual atualiza mantendo cursor e input fluido no `textarea`.

### Performance

- Lazy-load de linguagens Shiki nao carregadas.
- Cache de resultado por chave `(code, effectiveLanguage, theme)` quando viavel.
- Evitar recomputacao sincrona pesada a cada keypress sem debounce.

### Acessibilidade

- `textarea` continua sendo fonte primaria de foco e digitacao.
- Seletor de linguagem acessivel por teclado.
- Contraste dos tokens de syntax highlight deve respeitar legibilidade minima.

### Seguranca

- HTML do highlight deve vir apenas do renderer de syntax highlight (Shiki).
- Proibir injeccao arbitraria fora desse pipeline.

## Critrios de aceite

- Colar snippet em linguagem comum (JS, TS, Python, SQL, Bash) aplica highlight automaticamente em ate 300ms apos idle.
- Usuario consegue trocar para modo manual e forcar outra linguagem.
- Usuario consegue voltar para `Auto` e recuperar deteccao automatica.
- Snippets ambiguos nao quebram o editor; fallback para `plaintext`.
- Em mobile e desktop, editor permanece utilizavel e alinhado visualmente.

## Plano de implementacao (to-dos)

- [ ] Definir aliases e nomes exibidos para a lista Web + Backend popular da V1.
- [ ] Criar modulo de deteccao (`highlight.js`) com fallback robusto.
- [ ] Refatorar `CodeEditor` para arquitetura de duas camadas (input + highlighted).
- [ ] Integrar Shiki client-side com carregamento lazy de linguagem.
- [ ] Implementar seletor de linguagem com `Auto` + override manual.
- [ ] Sincronizar scroll, line-height e line numbers entre camadas.
- [ ] Validar comportamento com snippets curtos e ambiguos.
- [ ] Testar UX em desktop e mobile.
- [ ] Medir impacto de performance (digitação continua sem lag perceptivel).
- [ ] Documentar decisoes finais de linguagem e fallback no README/spec complementar.

## Riscos e mitigacoes

- Deteccao errada em snippets curtos:
  - mitigacao: threshold minimo de confianca/heuristica e fallback para `plaintext`.
- Custo de highlight em textos longos:
  - mitigacao: debounce + lazy-load + cache simples.
- Desalinhamento visual entre camada editavel e highlighted:
  - mitigacao: mesma fonte, line-height, padding e sincronizacao de scroll.

## Perguntas em aberto

1. No modo `Auto`, devemos exibir badge de confianca (ex.: `Auto: TypeScript (alta)`) ou manter interface minimalista?
2. Qual deve ser o limite de tamanho do snippet para manter highlight em tempo real antes de degradar para modo simplificado?

## Recomendacao padrao (se nao houver definicao)

- Lista curada de linguagens principais inicialmente.
- Sem badge de confianca na V1 (somente label de linguagem efetiva).
- Limite de ~500 linhas para highlight em tempo real; acima disso aplicar estrategia degradada.
