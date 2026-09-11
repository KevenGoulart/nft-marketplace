# Arquitetura

Resumo de como a aplicação funciona por baixo: contratos da API simulada, sessão, carrinho, cache e o que muda em relação ao Figma. Pra setup/comandos, veja o `README.md`.

## Stack

React 19 + TypeScript, Vite, TanStack Router (rotas por arquivo em `src/routes`), TanStack Query, Axios, Tailwind CSS v4, MSW. Código por feature em `src/features/<feature>/{api,queries,components}`; contratos tipados com Zod em `src/api/contracts`; o "backend" (banco em memória + `localStorage`) vive em `src/mocks`.

## Contratos REST

Schemas Zod em `src/api/contracts/*.ts` — a mesma fonte serve o cliente Axios e os handlers do mock, então não existe tipo duplicado entre transporte e UI. Base: `VITE_API_BASE_URL` (padrão `/api`).

| Recurso | Endpoint |
| --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/session`, `POST /auth/logout` |
| Catálogo | `GET /nfts` (filtros/ordenação/paginação via query string), `GET /nfts/:id` |
| Favoritos | `GET /favorites`, `POST` / `DELETE /favorites/:nftId` |
| Carrinho | `GET /cart`, `POST /cart/items`, `PATCH`/`DELETE /cart/items/:itemId`, `POST`/`DELETE /cart/coupon`, `POST /cart/merge` |
| Checkout | `POST /quote`, `POST /orders` (com header `Idempotency-Key`), `GET /orders/:id` |
| Conta | `GET`/`PATCH /profile`, `POST /profile/password`, `GET /wallets`, `PUT /wallets/:slot` |

Fora dessa tabela existe um punhado de endpoints só de mock/teste (`/mock/reset`, `/mock/scenario`, condições de rede, etc.) — não fazem parte do "produto", são descritos no `README.md`.

Todo erro vira um corpo único (`{ error: { code, message, fields? } }`) — o interceptor do Axios normaliza qualquer erro de rede/HTTP nesse formato, então o resto do app nunca lida com `AxiosError` cru. `POST /orders` exige `Idempotency-Key`: reenviar a mesma chave com o mesmo payload devolve o pedido já criado (sem duplicar); com payload diferente, dá conflito. Isso cobre clique duplicado e reenvio depois de um timeout.

## Eventos em tempo real (Socket.IO)

| Evento | O que carrega | O que o cliente faz |
| --- | --- | --- |
| `nft.updated` | preço/edições disponíveis do NFT | atualiza o cache direto (detalhe + listas do catálogo) |
| `order.updated` | novo status do pedido | só invalida `["order", id]` — os detalhes finais (comprovante, motivo de recusa) vêm sempre de um `GET` fresco |

Os dois eventos carregam uma `version`; o cliente ignora qualquer evento com versão igual ou menor que a já conhecida, então duplicata ou evento fora de ordem não regride nada. Comprar um NFT de verdade reduz suas edições e dispara `nft.updated` pra quem mais estiver com aquele item aberto/no carrinho — o cenário "preço muda enquanto alguém está de olho" acontece sozinho, sem precisar simular nada.

## Política de sessão

Token guardado em memória + `localStorage`, nunca a senha. A sessão é uma query do TanStack Query que só muda por ação explícita (login/cadastro/logout) ou quando o servidor devolve 401 com um token setado — nesse caso a app limpa tudo que não é a sessão e manda pro login, guardando a rota atual pra voltar depois de logar de novo. Rotas privadas (checkout, conta) checam a sessão antes de renderizar e redirecionam se não tiver ninguém logado.

## Estado do carrinho

- A cotação (preço, desconto, taxa) **nunca é calculada no cliente** — vem sempre fresca da API a cada `GET /cart`.
- Visitante tem carrinho próprio (identificado por um header, sem cookie); ao logar, ele é somado ao carrinho da conta (nunca substituído).
- Toda mudança de quantidade valida contra as edições disponíveis do NFT.
- Valores em ETH trafegam como string (não `number`), pra não perder precisão.
- Tudo persiste em `localStorage`, sobrevive a refresh.

## Cache (TanStack Query)

Padrão: 30s de `staleTime`, 1 retry, sem refetch automático ao focar a janela. Alguns ajustes por feature:

- **Catálogo:** cada combinação de filtro tem sua própria chave de cache, e a página anterior fica visível enquanto a próxima carrega (sem flash de loading ao paginar).
- **Sessão:** nunca fica velha sozinha (`staleTime: Infinity`) — só muda por ação explícita, como descrito acima.
- **Favoritar** é o exemplo de atualização otimista do projeto: marca como favorito na hora, desfaz sozinho se a chamada falhar, e revalida com o servidor no final.
- Toda busca cancela a chamada anterior se o usuário trocar de filtro antes dela terminar (evita resposta antiga "vencendo" a mais nova).

## Reconciliação REST ↔ Socket.IO

Depois de uma queda de conexão (ou logout/troca de conta), o app não confia em eventos que possa ter perdido enquanto estava desconectado: ao reconectar, ele invalida carrinho e pedido em andamento e busca esse estado de novo via REST. A identidade da conexão de socket é resincronizada em todo login/logout, pra um evento nunca ser entregue pra sessão errada.

## Limitações conhecidas

- Filtros de coleção/rede/preço são calculados no cliente a partir do catálogo carregado, não refletem outros filtros já ativos — aceitável dado o tamanho do catálogo de demonstração.
- Avatar de perfil é só cliente (recortado/redimensionado no navegador, guardado como imagem embutida) — sem servidor de arquivo real por trás.
- É uma SPA 100% renderizada no cliente, sem SSR — o primeiro conteúdo real só pinta depois do JS carregar e os mocks responderem (aceito, dado que o "backend" inteiro roda no navegador).

## Decisões de UX e desvios do Figma

- **Botões de aumentar/diminuir quantidade arredondados** — o Figma usa cantos retos; o arredondamento deixa esses botões consistentes com o resto dos controles da interface.
- **Formulário da tela de pagamento enxugado** — campos repetidos de nome/e-mail/documento foram removidos: essa informação já vem da conta logada, sem precisar redigitar.

**Mobile:**

- **Filtro de ordenação mantido**, mesmo com o espaço reduzido da tela.
- **Ícone central da barra de abas inferior removido** — não tinha uma função clara por trás.
- **Botão de comprar do detalhe do NFT aumentado**, pra aproveitar melhor o espaço disponível na tela.
- **Ícone de lixeira do carrinho reposicionado** — na posição original do Figma, ficava sobreposto por outro elemento.
- **Botão "Trocar carteira" removido da tela de pagamento com carteira** — repetia uma função que já existia em outro lugar da mesma tela.
