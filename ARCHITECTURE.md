# Arquitetura

Este documento registra as decisões de arquitetura, os contratos REST e de eventos, a política de sessão, o estado do carrinho, a estratégia de cache e a reconciliação entre REST e Socket.IO, além de limitações, decisões de UX e desvios do Figma. É atualizado incrementalmente conforme o plano de fases avança (seção final).

## Stack e organização

React 19 + TypeScript, Vite, TanStack Router (rotas por arquivo em `src/routes`), TanStack Query, Axios, Tailwind CSS v4, shadcn/ui, MSW. Código de domínio organizado por feature em `src/features/<feature>/{api,queries,components}.ts(x)`; contratos REST tipados (Zod) em `src/api/contracts`; o "backend" simulado vive em `src/mocks` (banco em memória persistido em `localStorage`, handlers MSW, cenários).

## Contratos REST

Todos os contratos são schemas Zod em `src/api/contracts/*.ts` (fonte única de verdade tanto para o cliente Axios quanto para os handlers MSW — não existem tipos duplicados entre transporte e UI). Base: `VITE_API_BASE_URL` (padrão `/api`).

| Recurso | Endpoint | Contrato |
| --- | --- | --- |
| Cadastro | `POST /auth/signup` | `signupRequestSchema` → `sessionResponseSchema` |
| Login | `POST /auth/login` | `loginRequestSchema` → `sessionResponseSchema` |
| Sessão atual | `GET /auth/session` | → `{ user: userSchema }` |
| Logout | `POST /auth/logout` | `204` |
| Catálogo | `GET /nfts` | `nftListParamsSchema` (query string) → `Paginated<nftSummarySchema>` |
| Detalhe do NFT | `GET /nfts/:nftId` | → `nftDetailSchema` |
| Favoritos | `GET /favorites` | → `favoritesResponseSchema` |
| Favoritar | `POST /favorites/:nftId` | `204` |
| Desfavoritar | `DELETE /favorites/:nftId` | `204` |
| Carrinho | `GET /cart` | → `cartSchema` (usa `X-Guest-Cart-Id` para visitante) |
| Adicionar item | `POST /cart/items` | `addCartItemRequestSchema` → `cartSchema` |
| Alterar item | `PATCH /cart/items/:itemId` | `updateCartItemRequestSchema` → `cartSchema` |
| Remover item | `DELETE /cart/items/:itemId` | → `cartSchema` |
| Aplicar cupom | `POST /cart/coupon` | `applyCouponRequestSchema` → `cartSchema` |
| Remover cupom | `DELETE /cart/coupon` | → `cartSchema` |
| Merge carrinho visitante→usuário | `POST /cart/merge` | `{ guestCartId }` → `cartSchema` |
| Cotação | `POST /quote` | `quoteRequestSchema` → `quoteSchema` |
| Criar pedido | `POST /orders` | header `Idempotency-Key` + `createOrderRequestSchema` → `orderSchema` (201) |
| Consultar pedido | `GET /orders/:orderId` | → `orderSchema` |
| Perfil | `GET /profile` | → `userSchema` |
| Atualizar perfil | `PATCH /profile` | `updateProfileRequestSchema` → `userSchema` |
| Alterar senha | `POST /profile/password` | `changePasswordRequestSchema` → `204` |
| Carteiras | `GET /wallets` | → `walletsResponseSchema` (`primary`/`secondary`) |
| Cadastrar/editar carteira | `PUT /wallets/:slot` | `upsertWalletRequestSchema` → `walletSchema` |
| Reset de cenário (utilitário, fora do contrato de produto) | `POST /mock/reset` | `204` |
| Trocar cenário ativo (utilitário) | `POST /mock/scenario` | `{scenario: "default" \| "payment_refused"}` → `204` |
| Simular mudança de NFT (utilitário) | `POST /mock/nfts/:nftId/simulate-update` | `{priceEth?, editionsAvailable?}` → `nftSummarySchema` |
| Derrubar conexões de tempo real (utilitário) | `POST /mock/realtime/disconnect-all` | `204` |

`quoteLineItemInputSchema`/`quoteLineItemSchema` carregam um `itemId` opcional: é o id do item no carrinho (necessário para `PATCH`/`DELETE /cart/items/:itemId`), preenchido apenas quando a cotação vem de um carrinho real (`GET/POST/PATCH/DELETE /cart*`); a cotação ad-hoc do checkout (`POST /quote`) não tem carrinho por trás e o omite.

### Erros

Todo erro de domínio (`src/mocks/db/errors.ts`) é convertido pelo handler em um corpo único (`apiErrorSchema`, `src/api/contracts/common.ts`):

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "campo": ["motivo"] } } }
```

| Código | HTTP | Origem |
| --- | ---: | --- |
| `VALIDATION_ERROR` | 422 | corpo/parâmetros inválidos (Zod) |
| `UNAUTHENTICATED` | 401 | token ausente/inválido |
| `NOT_FOUND` | 404 | recurso inexistente |
| `CONFLICT` | 409 | conflito genérico (ex.: e-mail já cadastrado) |
| `AVAILABILITY_CONFLICT` | 409 | quantidade pedida excede edições disponíveis |
| `QUOTE_OUTDATED` | 409 | `quoteVersion` enviado não bate com a cotação atual no momento da criação do pedido |
| `IDEMPOTENCY_CONFLICT` | 409 | mesma `Idempotency-Key` reusada com payload diferente |
| `COUPON_INVALID` | 400 | cupom inexistente/não aplicável |
| `COUPON_EXPIRED` | 410 | cupom expirado |
| `TRANSIENT_FAILURE` | 500 / 0 | falha simulada de rede/servidor não mapeada |

O interceptor de resposta do Axios (`src/api/client.ts`) normaliza qualquer erro de rede/HTTP nesse mesmo formato (`ApiRequestError`), garantindo que o restante da aplicação nunca trate `AxiosError` diretamente.

### Idempotência de pedidos

`POST /orders` exige o header `Idempotency-Key`. O mock guarda `hash(payload)` por `(userId, key)`: reenviar a mesma chave com o mesmo payload retorna o pedido já criado (sem duplicar); reenviar a mesma chave com payload diferente responde `IDEMPOTENCY_CONFLICT`. Isso cobre clique duplicado e reenvio após timeout (seção 7 do enunciado).

## Política de sessão

- Token opaco (`Bearer`) guardado em memória + `localStorage` (`kurio.auth.token`) via `getAuthToken`/`setAuthToken` em `src/api/client.ts`. Nunca se guarda senha em claro (mock usa hash simples em `mocks/db/users.ts`; nunca serializado de volta — ver `toWireUser`).
- A sessão é modelada como uma TanStack Query (`sessionQueryOptions`, `staleTime: Infinity`) — só muda por ação explícita (login/signup/logout) ou pelo evento `kurio:session-expired`, nunca por refetch automático em background.
- **Recuperação após refresh:** o token persiste em `localStorage`; ao montar a árvore, a query de sessão (`GET /auth/session`) revalida o token contra o mock.
- **Expiração durante navegação/checkout:** o interceptor Axios detecta `401` (`src/api/client.ts`) e dispara `SESSION_EXPIRED_EVENT` **somente se havia um token setado** (nunca para um 401 "esperado" de quem nunca logou). O listener (`session-expired.ts`) limpa a query de sessão, descarta todo cache com chave diferente de `session`, e redireciona a `/login?redirect=<rota atual>` para retomar o fluxo após novo login.
- **Rotas privadas:** `requireAuth` (`features/auth/require-auth.ts`) é usado como `beforeLoad` do TanStack Router; usa `queryClient.ensureQueryData(sessionQueryOptions)` (não duplica a chamada de rede se a sessão já foi resolvida na navegação) e redireciona para `/login` preservando `location.href` em `redirect` quando não há sessão.
- **Troca de usuário/logout:** login, signup e logout compartilham a mesma rotina (`adoptSession` / `onSettled` do logout) — atualizam a query `session` primeiro (para não perder notificação de observers já montados, ex. cabeçalho) e só então fazem `removeQueries` de tudo que não é `session`, garantindo que nenhum dado privado (carrinho, favoritos, pedidos) do usuário anterior sobreviva à troca.

## Estado do carrinho

- **Fonte de verdade:** a lista de itens (`nftId` + `quantity`) vive no mock-db; a cotação (`quote`) embutida na resposta de `/cart` é **sempre recalculada pela API**, nunca derivada/cacheada "cegamente" no cliente além do `staleTime` normal do Query.
- **Visitante vs. autenticado:** carrinho de visitante é identificado por `X-Guest-Cart-Id` (cabeçalho custom, sem cookie); ao autenticar, `POST /cart/merge` funde o carrinho de visitante no carrinho do usuário (por item, `quantity = min(soma, editionsAvailable)`), preservando os itens do visitante.
- **Disponibilidade:** toda alteração de quantidade (`addCartItem`/`updateCartItem`) valida contra `editionsAvailable` do NFT (`assertAvailable`) e lança `AvailabilityConflictError` (409) se exceder.
- **Cupom:** `applyCoupon` recalcula a cotação com o código antes de persistir — cupom inválido/expirado nunca fica "meio aplicado".
- **Precisão em ETH:** todo valor monetário trafega como string decimal (`ethAmountSchema`, regex `^\d+(\.\d+)?$`), nunca `number`, para não perder precisão em cálculo/apresentação; quantidades são sempre inteiras.
- **Persistência:** o mock-db inteiro (carrinhos, usuários, pedidos etc.) é persistido em `localStorage` (`src/mocks/db/store.ts`) para sobreviver a refresh; `POST /mock/reset` restaura o cenário conhecido.
- **UI do carrinho** (`src/routes/cart.tsx`, `src/features/cart/components/*`): tabela desktop / cartões mobile fiéis ao Figma, com stepper de quantidade (bloqueado em `editionsAvailable`), remoção, cupom (aplicar/remover/erro de código inválido ou expirado), skeleton com shimmer e estados vazio/erro. Verificado manualmente: carrinho de visitante persiste entre reloads, merge ao logar soma aos itens já existentes no carrinho do usuário (não substitui), e logout limpa o carrinho da tela (novo carrinho de visitante vazio).

## Estratégia de cache (TanStack Query)

Defaults globais (`src/app/query-client.ts`): `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`. Cada feature especializa quando o padrão não serve:

- **Catálogo** (`useNftsQuery`): `queryKey` inclui todos os parâmetros (`search/collection/network/preço/sort/page`) — isolamento total por combinação de filtro; `placeholderData: keepPreviousData` evita flash de loading ao paginar, mas o skeleton ainda aparece na primeira busca de cada filtro novo.
- **Facetas do catálogo** (`useCatalogFacetsQuery`): busca agregada derivada no cliente (sem endpoint de agregação dedicado — fora de escopo do mock); `staleTime: 60_000` já que contagens globais mudam pouco.
- **Sessão** (`sessionQueryOptions`): `staleTime: Infinity`, `retry: false` — só muda por ação explícita ou pelo evento de expiração (ver política de sessão acima).
- **Detalhe do NFT** (`nftDetailQueryOptions`): `retry` customizado — não tenta de novo em 404 (NFT inexistente é definitivo), tenta 1x para as demais falhas.
- **Cancelamento de respostas obsoletas:** toda `queryFn` que aceita `signal` do Query o repassa ao Axios (`fetchNfts`, `fetchCart`, `fetchNftDetail`), então o Query cancela a requisição HTTP real ao trocar de filtro/parâmetro antes da resposta anterior chegar — cobre "respostas fora de ordem".
- **Invalidação:** mutations chamam `setQueryData`/`invalidateQueries` nas chaves afetadas (ex.: favoritar invalida `["nft", id]` e `["nfts"]`); nenhuma tela lê estado remoto fora do Query.

### Atualização otimista (favoritos)

`useToggleFavoriteMutation` (`features/nft-detail/queries.ts`) é a mutation otimista de referência do projeto:
1. `onMutate` cancela queries em voo de `["nft", id]` e `["nfts"]`, guarda snapshot do estado anterior (detalhe + todas as listas de catálogo cacheadas) e escreve `isFavorite` otimisticamente em ambos.
2. `onError` restaura o snapshot exato se a mutation falhar.
3. `onSettled` invalida `["nft", id]` e `["nfts"]` para reconciliar com o servidor.

Otimismo só é aplicado se `isAuthenticated` (favoritos exigem sessão).

## Checkout e pedidos

- **Rotas:** `routes/checkout.tsx` é um **layout puro** (`beforeLoad: requireAuth`, componente só renderiza `<Outlet/>`) — existe unicamente para compartilhar o guard de autenticação entre `routes/checkout.index.tsx` (formulário de pagamento, `/checkout`) e `routes/checkout.confirmation.$orderId.tsx` (`/checkout/confirmation/:orderId`), que o TanStack Router aninha automaticamente como filhas por convenção de nome de arquivo. **Importante:** a lógica de recuperação de pedido pendente (abaixo) vive só em `checkout.index.tsx`, nunca no layout — colocá-la no layout a faz rodar também ao entrar na confirmação (sua ancestral), redirecionando para si mesma em loop (`Error: Too many redirects`, já reproduzido e corrigido nesta fase).
- **Perfil do colecionador:** o Figma mistura campos de perfil/carteira (nome de usuário, ENS, código de indicação, tipo de carteira) num único formulário "Perfil do colecionador" na tela de pagamento. O contrato real (`collectorInfoSchema`) é mais enxuto — `{name, email, document}` — e é isso que a UI implementa; carteira e rede são resolvidas por um componente à parte (`WalletConnectSelect`) que usa as carteiras já cadastradas (`GET /wallets`), não endereço digitado ad-hoc. Desvio documentado do Figma.
- **Seleção de carteira e simulação de conexão** (`features/checkout/components/wallet-connect-select.tsx`): lista `primary`/`secondary` como opções (cada carteira já carrega sua própria `network`, então escolher a carteira decide a rede do pedido). "Conectar" e "Simular recusa" são estados 100% client-side com um delay simulado (900ms) — nunca uma chamada de rede disfarçada de evento (proibido pelo enunciado). Se o usuário não tem nenhuma carteira, o mesmo componente cai para um formulário inline de cadastro (`features/wallets/components/wallet-form.tsx`, reusado depois na tela dedicada de Carteiras da Fase 8).
- **Revalidação antes de confirmar:** ao clicar "Confirmar compra", o cliente primeiro dá `refetch()` no carrinho (preço/cupom/disponibilidade/taxa atuais) e só então monta o payload do pedido com esses dados frescos — não confia no que já estava renderizado.
- **Idempotência no cliente** (`features/checkout/pending-order.ts`): antes do primeiro envio, gera e persiste em `localStorage` uma `Idempotency-Key` (UUID) atrelada ao `userId`; reenvios (clique duplicado, retry após timeout) reusam a mesma chave enquanto ela não foi resolvida, batendo no comportamento idempotente do mock (`IDEMPOTENCY_CONFLICT` em `src/mocks/db/orders.ts`). Em `QUOTE_OUTDATED`/`AVAILABILITY_CONFLICT` a chave é descartada (o próximo payload será diferente, então reusá-la geraria conflito) e o usuário precisa revisar e confirmar de novo — "mudanças exigem nova confirmação".
- **Recuperação de pedido pendente:** o `beforeLoad` de `checkout.index.tsx` consulta o ponteiro salvo (`{idempotencyKey, userId, orderId}`); se há um `orderId` e o pedido ainda está `pending`, redireciona direto para a confirmação em vez de mostrar o formulário de novo (cobre refresh/reconexão durante o processamento, sem criar outra compra). O ponteiro é isolado por `userId`: login como outro usuário no mesmo navegador o descarta (`clearPendingCheckoutIfOtherUser`); login como o **mesmo** usuário após expiração de sessão o preserva (retomada); logout sempre limpa.
- **Resolução do pedido** (`src/mocks/db/orders.ts`): 2500ms após criação, o mock resolve para `confirmed` ou `refused` conforme o cenário ativo (`payment_refused`, ver seção de Mocking). Só no caminho confirmado os itens comprados saem do carrinho; recusa e falhas preservam o carrinho intacto.
- **Confirmação** (`routes/checkout.confirmation.$orderId.tsx`): a atualização ao vivo vem do evento `order.updated` (Socket.IO — ver seção seguinte), não de polling; `refetchInterval` existe só como rede de segurança de baixa frequência (5s) caso o socket não esteja conectado. Ao chegar a um estado terminal, `useSettlePendingCheckout` limpa o ponteiro de pendência e (se confirmado) invalida o cache do carrinho. O recibo renderiza o `quoteSnapshot` do pedido — um snapshot imutável no momento da criação, então alterações posteriores no catálogo nunca mudam os valores exibidos.

## Tempo real (Socket.IO)

### Transporte e limitações do ambiente de mocks

- **`socket.io-client`** no app + **`@mswjs/socket.io-binding`** (sobre `ws.link()` do MSW) no mock, exatamente como sugerido no enunciado. Só o transporte `["websocket"]` é usado — sem long-polling do Engine.IO — porque o binding intercepta na camada de WebSocket do `@mswjs/interceptors`; não há handler HTTP de polling do Engine.IO neste projeto. Essa é uma limitação deliberada do ambiente de mocks, sem efeito no app publicado (que também força `websocket`).
- **URL do canal**: `ws://example.com` (`src/api/contracts/realtime.ts`, `REALTIME_URL`) — domínio reservado (RFC 2606) só para deixar claro nos logs que a conexão é simulada; o binding intercepta antes de qualquer tentativa de rede real. Sem pathname: o `socket.io-client` trata o pathname de uma URL de conexão como *namespace* Socket.IO (recurso não suportado pelo binding — "algumas funcionalidades como namespaces/rooms podem faltar"), não como caminho de transporte; a conexão real acontece sempre em `/socket.io/`, e `ws.link(REALTIME_URL)` já casa com isso (MSW ≥ 2.7.5 reconhece esse prefixo automaticamente).
- **Rooms/broadcast seletivo não existem no binding.** Como `order.updated` só pode ir para o dono do pedido, o mock mantém seu próprio registro de conexões (`src/mocks/realtime/server.ts`, `Set<{ io, userId }>`) e itera manualmente para decidir quem recebe cada evento, em vez de usar semântica de "salas" do Socket.IO.
- **Armadilha de ordem de import (achada e corrigida nesta fase):** `engine.io-client` captura a referência de `WebSocket` no momento em que é importado. Como a árvore de rotas do TanStack Router é estaticamente alcançável a partir de `main.tsx` e é avaliada antes do `await startMockWorker()` resolver, um `import "socket.io-client"` no topo de qualquer arquivo daquela árvore captura o `WebSocket` **nativo**, antes do MSW conseguir interceptá-lo — toda conexão subsequente vaza para a rede real (e falha, já que `example.com` não fala WebSocket). A correção: `src/features/realtime/socket.ts` importa `socket.io-client` dinamicamente (`import("socket.io-client")`) dentro de `getRealtimeSocket()`, garantindo que só é avaliado depois que o mock já patchou o `WebSocket` global. `import type { Socket }` no topo do arquivo é seguro (apagado em tempo de compilação, não gera import em runtime).

### Eventos

| Evento | Payload (`src/api/contracts/realtime.ts`) | Efeito no cliente |
| --- | --- | --- |
| `nft.updated` | `{id, resource:"nft", nftId, version, priceEth, previousPriceEth, editionsAvailable, updatedAt}` | Aplicado diretamente ao cache (`["nft", id]` e listas `["nfts", ...]`) se `version` for maior que a já conhecida — carrega os campos completos porque só descreve o NFT, sem risco de duplicar um schema maior. |
| `order.updated` | `{id, resource:"order", orderId, version, status, updatedAt}` | Nunca é aplicado direto ao cache — só invalida `["order", orderId]` (se `version` for maior) para forçar um `GET /orders/:id` fresco, fonte única dos campos terminais (`transactionRef`, `explorerUrl`, `refusalReason`) sem duplicar o schema do pedido no transporte de eventos. |

Ambos carregam `id` (identidade estável do evento) e `version` do próprio recurso — o cliente descarta qualquer evento com `version` ≤ à já conhecida no cache, tolerando duplicatas e eventos fora de ordem sem regredir estado nem reaplicar efeitos (`src/features/realtime/use-realtime-sync.ts`).

### Publishers (mock)

- `src/mocks/db/nfts.ts` expõe `subscribeNftUpdates`/`decrementEditions`/`applyNftChange`. `decrementEditions` é chamado pela resolução do pedido (`orders.ts`, caminho confirmado) — **comprar um NFT reduz suas edições disponíveis de verdade e emite `nft.updated` para todo mundo conectado**, inclusive quem tem o mesmo item aberto ou no carrinho em outra aba/sessão (o cenário "preço muda enquanto outro usuário está de olho no item" acontece organicamente, não só via simulação manual).
- `src/mocks/db/orders.ts` expõe `subscribeOrderUpdates` (já existia da Fase 6) — chamado pela resolução do pedido (`pending` → `confirmed`/`refused`).
- `src/mocks/realtime/server.ts` assina os dois publishers uma única vez (nível de módulo) e emite para as conexões WS registradas: `nft.updated` em broadcast (dado público, inclusive para visitantes); `order.updated` só para a conexão cujo `userId` (resolvido do token na query string da conexão, `?token=...`) bate com o dono do pedido — uma sessão anterior (visitante ou outro usuário) que ainda esteja conectada nunca recebe.

### Utilitários de teste/demonstração (fora dos contratos de produto)

- `POST /mock/nfts/:nftId/simulate-update` — força preço/disponibilidade a mudar sob demanda (`{priceEth?, editionsAvailable?}`), pelo mesmo caminho de código que uma mudança orgânica (garante que REST e evento fiquem sempre coerentes). Usado manualmente nesta fase para validar o cenário do enunciado (NFT no carrinho, preço muda, carrinho avisa e atualiza, checkout impede confirmação com cotação desatualizada) e será a base dos testes Playwright do cenário de tempo real (Fase 10).
- `POST /mock/realtime/disconnect-all` — fecha todas as conexões WS simuladas, para exercitar a reconexão automática do `socket.io-client` e a reconciliação subsequente.

### Reconciliação, sessão e ciclo de vida

- **Identidade da conexão:** o token de auth vai como query string na URL de conexão (`?token=...`), não no `auth` handshake do Socket.IO (o binding não expõe esse handshake) — lido do lado do mock via `connection.client.url.searchParams`.
- **Troca de sessão:** `resyncRealtimeAuth()` (chamada em login/signup, logout e expiração de sessão — `features/auth/queries.ts`, `session-expired.ts`) atualiza a query string e força desconectar+reconectar, para que o mock reavalie a identidade da conexão a cada troca; sem isso, uma conexão aberta como usuário A continuaria "sendo" o usuário A no registro do servidor mesmo após logout/troca.
- **Reconciliação pós-reconexão:** `onRealtimeReconnect` (dispara no evento `connect` do socket, exceto na primeira vez) invalida `["cart"]` e `["order"]` — os recursos ativos vêm sempre de um `GET` fresco à API REST depois de uma queda, nunca de eventos presumidos perdidos durante a desconexão.
- **Aviso ao usuário:** `nft.updated` que afeta um item do carrinho aberto também empurra uma mensagem em `features/realtime/notices.ts` (lista compartilhada via cache do Query, sem lib de estado global) — renderizada em `/cart` e `/checkout` (`RealtimeNotices`), dispensável pelo usuário.
- **Ciclo de vida dos listeners:** `useRealtimeSync()` (montado uma vez em `routes/__root.tsx`) registra os listeners de evento dentro de um `useEffect` e os remove no cleanup — nunca listeners globais permanentes fora do ciclo de vida do componente.

## Cenários de mock

`src/mocks/scenarios.ts` guarda o cenário ativo (`default` | `payment_refused`) em memória + `localStorage` (`kurio.mock.scenario`), lido pelos handlers/DB para variar o comportamento sem mudar código do app. Hoje só existe o cenário de pagamento recusado (`payment_refused` faz `scheduleResolution` em `orders.ts` resolver pedidos novos como `refused` em vez de `confirmed`); os demais cenários de falha listados no enunciado (§6) serão adicionados nas fases que os exercitam. `POST /mock/scenario` (`{scenario}`, Fase 10) troca o cenário ativo via HTTP — criado porque os testes Playwright rodam num processo Node separado do navegador e não conseguem chamar `setActiveScenario()` diretamente; o endpoint só tem efeito quando chamado de dentro da página (`fetch` no contexto do browser, para passar pelo Service Worker do MSW — `page.request` do Playwright não passa por ele).

## Perfil e carteiras

- **Sidebar compartilhada** (`features/account/components/account-sidebar.tsx`): navegação entre `/account/profile` e `/account/wallets`, mais itens do Figma fora do escopo do desafio (Atividade, Lista de interesse, Ofertas, Arquivos baixados, Suporte) renderizados desabilitados (`aria-disabled`, sem link) em vez de omitidos — mantém a paridade visual com o Figma mas deixa claro que não são funcionais. "Sair" reusa `useLogoutMutation` e navega para `/`.
- **Dados do perfil** (`routes/account.profile.tsx`): dois formulários independentes (react-hook-form + Zod), cada um com seu próprio botão "Salvar" — desvio deliberado do Figma, que mostra um único botão "Salvar" no rodapé da tela para nome/e-mail/avatar/senha juntos. Contrato real (`UpdateProfileRequest`) e o de troca de senha (`ChangePasswordRequest`) são operações distintas no backend mock (`PATCH /profile` vs `POST /profile/password`, com verificação de senha atual), então um único submit exigiria inventar um contrato combinado sem equivalente real; dois formulários também evitam pedir a senha atual só para salvar nome/e-mail.
  - **Cache**: perfil não tem `queryKey` próprio — `useUpdateProfileMutation` escreve o resultado direto em `sessionQueryKey` (`setQueryData`), a mesma chave usada por `useSession()`. Evita duas fontes de verdade divergentes para os dados do usuário logado.
  - **Avatar**: upload 100% client-side (`features/profile/components/avatar-field.tsx`) — sem backend de arquivos real, a imagem escolhida é recortada ao centro para um quadrado e redimensionada para 160px via Canvas 2D (`toDataURL('image/jpeg', 0.85)`), persistida como data URL dentro do próprio `avatarUrl` do perfil. **Limitação conhecida:** o mock guarda o usuário (incl. `avatarUrl`) em `localStorage`; avatares grandes/múltiplas trocas podem se aproximar da cota de armazenamento do navegador (~5-10MB) — aceitável para demonstração, não para produção.
- **Carteiras** (`routes/account.wallets.tsx`): dois slots fixos (`primary`/`secondary`, sem lista arbitrária de carteiras — contrato do enunciado é carteira principal + secundária, não uma coleção). Cada slot mostra um resumo (nome, endereço, badge de rede) com link "Editar", ou um estado vazio com botão "Adicionar"; ambos alternam para o `WalletForm` inline (mesmo componente reusado do fallback de conexão de carteira no checkout — Fase 6). Editar passa `defaultValues` com os valores atuais da carteira para o form pré-preencher; salvar ou cancelar volta ao modo de resumo.
  - Endereço da carteira usa `break-all` no card de resumo (achado durante o teste de responsividade desta fase: a string de 42 caracteres sem espaços estourava a largura do container em telas estreitas, causando scroll horizontal).

## Limitações e decisões de UX conhecidas

- Facetas de filtro (coleção/rede/faixa de preço) são calculadas no cliente a partir do catálogo inteiro (até 60 itens), não refletem os filtros já ativos — simplificação aceitável dado o volume de dados do mock, documentada em `features/catalog/queries.ts`.
- `POST /mock/reset` é um endpoint utilitário fora dos contratos de produto, existe só para restaurar cenário conhecido em demonstração/testes.
- **Desvio do Figma no carrinho:** o card de item no Figma mostra "ID do token: #NNNN" (desktop) / "Edição: x/y" (mobile) — dados que não existem no contrato de cotação (`quoteLineItemSchema` não carrega token id nem número de série da edição, só `editionsAvailable`). A UI implementada mostra "N edições disponíveis" / "Última edição disponível" / "Esgotado" no lugar, derivado de dado real da API em vez de texto estático do mock do Figma.
- As seções decorativas do Figma fora do escopo do desafio (rodapé com links de central de ajuda/coleções/redes sociais, "Colecionadores também viram" no carrinho) foram propositalmente omitidas — não fazem parte da entrega (seção 1 do enunciado) e já não aparecem em nenhuma outra tela implementada (catálogo, detalhe).
- **Bug corrigido nesta fase:** `mergeGuestCartIntoUser` (`mocks/db/cart.ts`) podia deixar um item com `quantity: 0` no carrinho do usuário se a disponibilidade do NFT caísse a zero (ex.: via `nft.updated`) entre o visitante adicionar o item e autenticar — achado organicamente ao testar o cenário de tempo real. Agora um merge que resultaria em quantidade zero remove o item em vez de persisti-lo zerado.

## Acessibilidade e responsividade

- **Menu mobile do `SiteHeader`** (gap conhecido desde a Fase 5, agora resolvido): abaixo do breakpoint `md`, a nav principal e a área de busca/autenticação saem do header e migram para um `Sheet` (drawer lateral, `@radix-ui/react-dialog` via `components/ui/sheet.tsx`) acionado por um botão de hambúrguer (`MobileNav`, `components/layout/site-header.tsx`). O carrinho permanece sempre visível no header (acesso rápido), o resto do conteúdo (nav, busca, login/perfil/sair) fica dentro do drawer. Fechar por Escape, clique no overlay, no botão X ou ao navegar por um link (`SheetClose asChild` envolvendo cada `Link`) — foco retorna ao botão que abriu o menu (comportamento padrão do Radix Dialog).
- **Link "Pular para o conteúdo"** (`routes/__root.tsx`): âncora `sr-only` que só aparece com `focus-visible` (primeiro elemento tabulável da árvore), pulando a navegação do header e indo direto para `<main id="main-content">` — essencial para quem navega por teclado, já que a lista de NFTs/links do header pode ser longa.
- **Hierarquia de headings corrigida:** um passe pela árvore de rotas encontrou páginas sem `h1` (`/login`, `/signup`, `/account/profile`, `/account/wallets`, confirmação de pedido) ou com um `h1` semanticamente errado (checkout usava "Perfil do colecionador", uma seção, como título da página). Cada rota agora tem exatamente um `h1` (visível ou `sr-only` quando o título visual já é coberto por um componente decorativo como `CardTitle`, que renderiza `<div>`, não heading) e as seções internas usam `h2` em sequência, sem pular níveis.
- **Toolbar do catálogo:** o grupo "Todos os NFTs / Novos lançamentos / Em alta" usava `role="tablist"`/`role="tab"`/`aria-selected`, mas nunca implementou o padrão ARIA de tabs completo (não há `tabpanel` associado nem navegação por setas) — falha grave para leitor de tela, que anunciaria "tab 1 de 3" e o usuário esperaria teclas de seta que não funcionam. Trocado por `role="group"` com botões simples `aria-pressed` (mesmo padrão já usado no botão de favoritar), semântica honesta com o comportamento real.
- **`<dl>` inválido em `CartSummary` e `OrderReview`:** a linha "Taxa de rede" envolvia o par `dt`/`dd` num `<div>` extra e adicionava um `<p>` de legenda ("Taxa estimada") como filho direto do `<dl>` — o modelo de conteúdo de `<dl>` só aceita grupos de `dt`+`dd` (opcionalmente agrupados em um único `<div>`, nunca aninhados em dois níveis) e não aceita `<p>` solto. Corrigido movendo a legenda para dentro do próprio `<dd>` (valor e legenda empilhados, mesma aparência visual).
- **Auditoria automatizada:** todas as rotas principais (catálogo, NFT detalhe, carrinho, checkout, confirmação, login, cadastro, perfil, carteiras) foram varridas com `axe-core` (injetado via console do navegador) — zero violações após as correções acima. A verificação de responsividade usa a técnica de `<iframe>` injetado em 390px (o `resize_window` da automação de navegador não altera o viewport real renderizado) — sem overflow horizontal remanescente em nenhuma rota testada.
- **Atualização (Fase 10):** a auditoria `axe-core` foi formalizada como suíte Playwright (`e2e/accessibility.spec.ts`), rodando contra as mesmas rotas verificadas manualmente aqui — deixou de ser pontual. Lighthouse (performance) foi auditado na Fase 11, ver seção própria abaixo.

## Testes (Playwright)

- **Stack:** `@playwright/test` + `@axe-core/playwright` (regressão de acessibilidade, formalizando a auditoria da Fase 9). Config em `playwright.config.ts`: `webServer` sobe `npm run dev` numa porta fixa (`4173`, `--strictPort`, evita a subida incremental de porta que a Fase 9 documentou como incômodo operacional) e espera o servidor responder antes de rodar os testes; `reuseExistingServer` fora de CI evita reiniciar um servidor de dev já aberto.
- **Sem backend real para "resetar" entre testes:** cada teste do Playwright roda por padrão numa `BrowserContext` nova (storage isolado), e o mock (`src/mocks/db/store.ts`) semeia dados frescos sempre que não encontra um snapshot em `localStorage` — então o isolamento entre testes vem de graça, sem precisar de um hook de reset explícito. `resetMock`/`setScenario` (`e2e/fixtures.ts`) existem para os casos que precisam mudar o cenário ativo (`payment_refused`) ou forçar um reset no meio de um teste.
- **Armadilha:** `/mock/*` só existe como rota interceptada pelo Service Worker do MSW dentro da página carregada no navegador — o cliente HTTP do Playwright (`page.request`, que roda no processo Node, fora do browser) não passa pelo worker e bateria direto no Vite sem efeito nenhum. `resetMock`/`setScenario` por isso rodam via `page.evaluate(() => fetch(...))`, nunca `page.request`.
- **Seed da Ana não é "vazio":** a usuária semeada já tem 2 itens no carrinho e 3 NFTs favoritados (`nft-1`, `nft-5`, `nft-12`) por padrão. Os testes de carrinho/favoritos usam contagens relativas (capturadas antes da ação, comparadas depois) e um NFT fora da lista de favoritos padrão, em vez de assumir um estado zerado — para continuar corretos se o seed mudar.
- **Duplicação desktop/mobile no DOM:** `CartItemRow` e o header (`SiteHeader`) renderizam uma variante para desktop e outra para mobile simultaneamente (alternadas via classes `hidden md:flex`/`md:hidden`, Fase 5/9) — ambas presentes no DOM, só uma visível por vez. Seletores por `role`/`label` (`getByRole`, `getByLabel`) já excluem a variante com `display:none` da árvore de acessibilidade e resolvem sozinhos; seletores CSS/atributo puros (`page.locator('a[href=...]')`) não filtram por visibilidade e resolvem para as duas — por isso os testes usam `:visible` (pseudo-classe do motor de seleção do Playwright) ou escopam a um contêiner (`<li>` do item) quando precisam de um seletor não baseado em role.
- **`role="alert"` não tem nome acessível derivado do conteúdo:** ao contrário de roles como `button`/`link`, a especificação ARIA marca `alert` como "Name from: author" (só `aria-label`/`aria-labelledby` contam) — `getByRole("alert", {name: "..."})` nunca casa com o texto interno de um `<p role="alert">texto</p>` sem `aria-label` explícito. Os testes usam `getByRole("alert")` sem filtro de nome, ou `getByText(..., {exact: true})` quando precisam desambiguar de um texto vizinho parecido.
- **Timing:** o bootstrap da app (`src/main.tsx`) espera `startMockWorker()` resolver antes de chamar `createRoot(...).render(...)` — o evento `load` do Playwright pode disparar antes desse render terminar, e um `page.goto()` seguido de leitura imediata do DOM (contagem de cards, contagem do carrinho) corre risco de capturar a página ainda vazia. Os testes que precisam de um valor inicial esperam por um elemento concreto renderizado (ex.: primeiro card do catálogo, primeiro `<li>` do carrinho) antes de medir, em vez de confiar em `page.goto()` sozinho.
- **Dois projetos:** `chromium` (Desktop Chrome, todos os specs exceto `*.mobile.spec.ts`) e `mobile-chromium` (viewport do Pixel 7, só `*.mobile.spec.ts`) — cobre o menu mobile do header (Fase 9), que só existe abaixo do breakpoint `md` e não faz sentido testar em viewport desktop.
- **Cobertura:** autenticação (guarda de rota + redirect preservado, login/erro, cadastro, logout), catálogo (busca, filtro por coleção, ordenação, paginação), NFT detalhe + carrinho (favoritar exige login, alterna estado, adicionar/alterar quantidade/remover), checkout (compra confirmada, compra recusada via `payment_refused`, validação de carteira não conectada), perfil/carteiras (atualizar dados, trocar senha e logar com a nova credencial, cadastrar/editar carteira), menu mobile do header, e a regressão de acessibilidade. Não cobre: tempo real via Socket.IO (a suíte de testes do MSW WebSocket binding é frágil o suficiente para justificar verificação manual contínua em vez de E2E, ver seção "Tempo real" acima) nem os cenários de falha do enunciado ainda não implementados (§6, fora do escopo até agora).

## Lighthouse (performance)

- **Script:** `npm run lighthouse` (`scripts/lighthouse.mjs`) builda a app (assume `npm run build` já rodado), sobe `vite preview` numa porta fixa (`4174`) e audita 4 rotas públicas com `lighthouse` + `chrome-launcher` em modo desktop headless, salvando HTML+JSON em `lighthouse/reports/` (fora do controle de versão, como testes/artefatos de auditoria em geral). Rodar contra o build de produção (não o servidor de dev) é deliberado — HMR, o overlay de erros do Vite e o React Query Devtools inflam bundle/tempo de forma que não reflete o app real.
- **Rotas auditadas:** `/`, `/nft/nft-1`, `/cart`, `/login` — só rotas públicas. **Rotas autenticadas (checkout, perfil, carteiras) ficam de fora**: o Lighthouse navega direto para a URL sem sessão, e semear `localStorage`/token antes da navegação exigiria orquestrar Chrome via Puppeteer em vez do fluxo simples `lighthouse(url, flags)` — não compensou a complexidade adicional dado que essas rotas já têm cobertura funcional completa via Playwright (Fase 10) e a auditoria manual de acessibilidade (Fase 9) já rodou `axe-core` nelas.
- **Resultado (após os ajustes desta fase):** Performance 67–69, Acessibilidade 96–100, Boas práticas 96, SEO 100 nas 4 rotas.
- **Corrigido nesta fase:**
  - **SEO 92→100:** faltava `<meta name="description">` em `index.html` — adicionada.
  - **Acessibilidade — alvo de toque:** o thumb do slider de faixa de preço (`filters-sidebar.tsx`, `.range-thumb::-webkit/-moz-range-thumb` em `src/index.css`) tinha 15×15px, abaixo do mínimo recomendado (24×24px) para toque. Aumentado para 24×24px. **Limitação da ferramenta:** o Lighthouse mede a caixa do elemento `<input type="range">` hospedeiro (uma faixa fina de poucos pixels de altura, proposital para o visual da trilha), não o pseudo-elemento do thumb — então o audit automatizado (`target-size`) continua acusando o input mesmo após a correção real. É um falso-negativo conhecido de ferramentas de auditoria com inputs de range customizados via pseudo-elemento; a correção vale pela usabilidade real, não pelo score.
  - **Performance — First Contentful Paint:** `src/main.tsx` espera `startMockWorker()` (registro do Service Worker do MSW) resolver antes do primeiro `render()` — sem isso, chamadas de API perderiam a corrida contra o worker ainda não pronto (decisão da Fase 2, não alterada aqui). Efeito colateral: a página ficava em branco (só `<div id="root">` vazio) até esse bootstrap terminar, monopolizando o FCP. Adicionado um shell estático em `index.html` (fundo escuro + wordmark "KURIO", sem JS) dentro do próprio `#root`, substituído pelo React assim que monta — pinta algo real na tela sem depender de JS, sem tocar na ordem de bootstrap.
- **Não corrigido, aceito como limitação conhecida:**
  - **Boas práticas — "errors-in-console":** o guest (visitante sem sessão) sempre recebe um `401` real de `GET /auth/session` — comportamento REST correto (não há sessão, o servidor nega), tratado graciosamente pela camada de auth (`useSession()`), mas o Chrome loga qualquer resposta de rede não-2xx como "Failed to load resource" no console **automaticamente, no nível do browser**, independente de como o JS trata a resposta — não há como suprimir isso do lado da aplicação. Falso-positivo comum em apps com endpoint de sessão que retorna 401 para anônimos.
  - **Performance — Largest Contentful Paint (~3.5s simulado):** o maior elemento visível (hero da home, imagem do NFT, etc.) só pinta depois de: JS baixar/parsear → MSW interceptar → fetch resolver → React renderizar. Numa SPA 100% client-side-rendered com backend inteiramente mockado (decisão de arquitetura desde a Fase 1 — sem SSR/SSG, fora do escopo do enunciado), não há conteúdo estático para o LCP "pegar carona": é uma limitação estrutural, não um bug pontual. O chunk do MSW (`browser-*.js`, ~165KB/57KB gzip) é o maior contribuinte de JS carregado antes do primeiro render, mas não é removível sem abrir mão do mock como "backend" do desafio.

## Plano de fases

Numeração de execução definida internamente pela equipe (o enunciado não numera fases — apenas seções temáticas). Atualizar aqui a cada fase concluída.

1. Setup (Vite, TS, Tailwind, shadcn, Router, Query) — ✅ concluída
2. Contratos REST + banco mock (MSW) — ✅ concluída
3. Sessão/autenticação (login, cadastro, proteção de rotas) — ✅ concluída
4. Catálogo/Início (busca, filtros, ordenação, paginação) — ✅ concluída
5. NFT detalhe + Carrinho (UI completa: item, stepper, remoção, cupom, resumo, skeleton, estados vazio/erro) — ✅ concluída
6. Checkout/Pagamento + Confirmação de pedido (perfil do colecionador, seleção/conexão de carteira, revalidação, idempotência, recuperação de pendente, recibo) — ✅ concluída
7. Tempo real (Socket.IO: `nft.updated`, `order.updated`, reconciliação, avisos no carrinho/checkout) — ✅ concluída
8. Perfil + Carteiras (dados do perfil, troca de senha, avatar, carteiras principal/secundária) — ✅ concluída
9. Acessibilidade e responsividade (menu mobile, skip link, hierarquia de headings, ARIA, auditoria axe-core) — ✅ concluída
10. Testes Playwright (E2E dos fluxos principais + regressão de acessibilidade via axe-core; sem regressão visual/screenshot) — ✅ concluída
11. Lighthouse (performance: script de auditoria, meta description, alvo de toque, shell de loading) — ✅ concluída
12. Documentação final (README completo com setup, credenciais, scripts, deploy) — ✅ concluída; **Deploy — pendente**, a critério do usuário (instruções em `README.md`, nenhum deploy foi executado)
