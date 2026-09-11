# NFT Marketplace

Desafio Frontend de um marketplace de NFTs: catálogo, detalhe do produto, carrinho, checkout com carteira simulada, tempo real (Socket.IO) e conta do usuário.

**Não tem backend.** Tudo é simulado no navegador com [MSW](https://mswjs.io/) — um banco em memória persistido no `localStorage`, semeado com dados de demonstração no primeiro carregamento.

## Rodando o projeto

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000` (ou a próxima porta livre, se ocupada). Não precisa configurar nada — os mocks já vêm ligados por padrão.

## Variáveis de ambiente

Nenhuma é obrigatória. Veja `.env.example`:

- `VITE_ENABLE_MOCKS` (padrão `true`) — desliga a camada MSW se `false`. Só faz sentido com um backend real, que este projeto não tem — deixe `true`.
- `VITE_API_BASE_URL` (padrão `/api`) — prefixo interceptado pelos mocks.

## Login de teste

- **E-mail:** `ana@kurio.test`
- **Senha:** `kurio123!`

Essa conta já vem com itens no carrinho, favoritos e uma carteira cadastrada, pra não precisar montar estado manualmente. Também dá pra criar uma conta nova pela tela de cadastro.

## Cenários e reset

O estado fica no `localStorage`. Se bagunçar durante um teste manual, reseta tudo (volta ao seed inicial) pelo console do navegador:

```js
fetch("/api/mock/reset", { method: "POST" });
```

Para forçar o cenário de pagamento recusado no checkout:

```js
fetch("/api/mock/scenario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: "payment_refused" }),
});
```

## Comandos

```bash
npm run dev          # ambiente de desenvolvimento
npm run build         # typecheck + build de produção (dist/)
npm run preview       # serve o build localmente
npm run typecheck     # só checagem de tipos
npm run lint          # ESLint
npm run test:e2e      # suíte Playwright (sobe o servidor sozinha)
npm run test:e2e:ui   # a mesma suíte, em modo interativo
npm run lighthouse    # audita performance/acessibilidade (precisa de build antes)
```

## Reproduzindo fluxos de falha

Pelo console do navegador, com a página já carregada:

```js
// deixa tudo lento
fetch("/api/mock/network", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ latencyMs: { min: 800, max: 2000 } }),
});

// derruba a "internet" (todo /api/* passa a falhar)
fetch("/api/mock/network", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ offline: true }),
});

// erro pontual na próxima chamada que bater esse método + caminho
fetch("/api/mock/network/fail-next", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ method: "GET", path: "/api/nfts", status: 500 }),
});

// derruba a resposta da próxima chamada (timeout) — bom pra ver a recuperação por
// Idempotency-Key ao criar um pedido
fetch("/api/mock/network/drop-next", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ method: "POST", path: "/api/orders" }),
});

// desliga tudo isso de novo
fetch("/api/mock/network/reset", { method: "POST" });
```

Outras falhas, sem precisar do console:

- **Cupom inválido:** qualquer código diferente de `BEMVINDO10`. **Expirado:** `EXPIRADA5`.
- **Preço/edição mudando durante a compra:** com o NFT já no carrinho, simule uma atualização (em outra aba, por exemplo):
  ```js
  fetch("/api/mock/nfts/nft-1/simulate-update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceEth: "9.99" }),
  });
  ```