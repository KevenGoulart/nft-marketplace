# NFT Marketplace

Implementação do desafio Frontend — Marketplace de NFTs: catálogo com busca/filtros/ordenação, detalhe de NFT, carrinho, checkout com carteira simulada, confirmação de pedido, atualizações em tempo real via Socket.IO, autenticação, perfil e carteiras do colecionador.

**Não há backend real.** Toda a API é simulada no navegador com [MSW](https://mswjs.io/) (REST + WebSocket) — um banco de dados em memória, persistido em `localStorage`, semeado com dados de demonstração a cada primeira carga. Isso é uma decisão deliberada do desafio (ver `ARCHITECTURE.md`), não uma limitação de implementação.

## Stack

React 19 · TypeScript · Vite · TanStack Router (rotas por arquivo) · TanStack Query · Axios · Zod · Tailwind CSS v4 · shadcn/ui (Radix) · react-hook-form · MSW (REST + WebSocket) · Socket.IO · Playwright · Lighthouse.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço impresso no terminal (o Vite sobe em `3000` e sobe de porta se estiver ocupada). Não é preciso configurar nada além disso — os mocks já vêm ativos por padrão.

### Variáveis de ambiente

Opcionais, veja `.env.example`:

| Variável | Padrão | Efeito |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` | Desliga a camada MSW se definida como `false` — só faz sentido com um backend real apontado por `VITE_API_BASE_URL`, que não existe neste projeto; deixar `true`. |
| `VITE_API_BASE_URL` | `/api` | Base usada pelo cliente Axios; os handlers MSW interceptam exatamente esse prefixo. |

### Credenciais de teste

O mock semeia uma colecionadora logável:

- **E-mail:** `ana@kurio.test`
- **Senha:** `kurio123!`

Ela já vem com 2 itens no carrinho, 3 NFTs favoritados e uma carteira principal cadastrada — útil para testar os fluxos sem precisar montar o estado manualmente. Também é possível criar uma conta nova pela tela de cadastro.

Se o estado ficar bagunçado durante testes manuais (pedidos pendentes, carrinho estranho), rode no console do navegador:

```js
fetch("/api/mock/reset", { method: "POST" })
```

Isso restaura o banco para o seed inicial e o cenário `default`. Para forçar o cenário de pagamento recusado:

```js
fetch("/api/mock/scenario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: "payment_refused" }),
})
```

(Esses dois endpoints são utilitários do mock, fora dos contratos de produto — ver `ARCHITECTURE.md`.)

## Scripts disponíveis

```bash
npm run dev          # servidor de desenvolvimento (Vite)
npm run build        # typecheck + build de produção (dist/)
npm run preview      # serve o build de produção localmente
npm run typecheck    # verificação de tipos (tsc -b, sem emitir)
npm run lint         # ESLint

npm run test:e2e     # suíte Playwright (E2E + regressão de acessibilidade)
npm run test:e2e:ui  # a mesma suíte, no modo interativo (UI mode)

npm run lighthouse   # audita performance/acessibilidade/SEO com Lighthouse
```

## Testes (Playwright)

`npm run test:e2e` sobe o próprio servidor de dev automaticamente (não precisa rodar `npm run dev` antes) e roda 25 testes cobrindo autenticação, catálogo, NFT detalhe + carrinho, checkout (incluindo o cenário de pagamento recusado), perfil/carteiras, o menu mobile do header e uma regressão automatizada de acessibilidade (`axe-core`). Relatório HTML em `e2e/playwright-report/` após a execução.

Detalhes de armadilhas e decisões (por que os testes usam contagens relativas, como o cenário de mock é trocado via HTTP, etc.) estão documentados na seção "Testes (Playwright)" de `ARCHITECTURE.md`.

## Auditoria de performance (Lighthouse)

```bash
npm run build
npm run lighthouse
```

Builda a app, sobe um `vite preview` numa porta isolada e audita 4 rotas públicas (`/`, `/nft/nft-1`, `/cart`, `/login`), salvando relatórios HTML/JSON em `lighthouse/reports/`. Resultado mais recente e as decisões de cada achado (o que foi corrigido, o que é limitação estrutural aceita) estão na seção "Lighthouse (performance)" de `ARCHITECTURE.md`.

## Arquitetura e decisões

`ARCHITECTURE.md` é a fonte de verdade para: contratos REST e de eventos Socket.IO, política de sessão, estado do carrinho, estratégia de cache do TanStack Query, reconciliação entre REST e tempo real, desvios deliberados do Figma, decisões de UX e limitações conhecidas (com a razão de cada uma). Vale a leitura antes de mexer em qualquer fluxo — várias decisões que parecem arbitrárias à primeira vista têm uma razão documentada ali (ex.: por que o checkout é dividido em rota-layout + rota-índice, por que o carrinho de visitante usa um header customizado em vez de cookie, por que `socket.io-client` é importado dinamicamente).

## Deploy

O build (`npm run build`) gera um site estático em `dist/` — sem servidor Node, sem variáveis de ambiente obrigatórias (os mocks rodam inteiramente no navegador). Qualquer hospedagem de site estático serve.

**Único requisito:** como as rotas são client-side (TanStack Router), o host precisa reescrever qualquer caminho não encontrado para `index.html` (fallback de SPA) — sem isso, recarregar a página em `/nft/nft-1` ou compartilhar um link direto para `/cart` retorna 404.

- **Vercel:** detecta Vite automaticamente e já aplica o fallback de SPA sem configuração adicional. Buildar com `npm run build`, output directory `dist`.
- **Netlify:** build command `npm run build`, publish directory `dist`, e um arquivo `public/_redirects` com `/* /index.html 200` (ou o equivalente `netlify.toml` com `[[redirects]]`).
- **Outro host estático (GitHub Pages, Cloudflare Pages, S3+CloudFront etc.):** mesma ideia — configurar o fallback de SPA equivalente à plataforma.

Este projeto ainda não foi implantado; os passos acima documentam como fazê-lo quando desejado.
