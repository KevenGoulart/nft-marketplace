import { test, expect } from "@playwright/test";
import { SEED_USER, login, queueFailure, setNetworkConditions } from "./fixtures";

// Escopado a #catalog-results: a sidebar também tem 1 link para /nft/:id no card
// "NFT em destaque".
const nftCards = (page: import("@playwright/test").Page) =>
  page.locator('#catalog-results a[href^="/nft/"]');

test.describe("Condições de rede simuladas (§6)", () => {
  test("catálogo mostra skeleton durante latência alta no primeiro carregamento e depois os resultados", async ({
    page,
  }) => {
    await page.goto("/");
    await nftCards(page).first().waitFor();

    // Persiste a condição (sobrevive a reload, como o cenário de negócio) e recarrega
    // para observar o efeito no carregamento inicial da página, com QueryClient zerado.
    await setNetworkConditions(page, { latencyMs: { min: 1200, max: 1200 } });
    await page.reload();

    await expect(page.getByRole("status", { name: "Carregando catálogo de NFTs" })).toBeVisible();
    await expect(nftCards(page).first()).toBeVisible({ timeout: 5000 });

    await setNetworkConditions(page, { latencyMs: null });
  });

  test("falha 500 ao trocar a ordenação mostra erro no catálogo e recupera ao tentar novamente", async ({
    page,
  }) => {
    await page.goto("/");
    await nftCards(page).first().waitFor();

    // O QueryClient tenta 1x de novo por padrão (retry: 1) — enfileira 2 falhas para
    // que a segunda tentativa automática também falhe e o estado de erro seja exibido.
    await queueFailure(page, { method: "GET", path: "/api/nfts", status: 500 });
    await queueFailure(page, { method: "GET", path: "/api/nfts", status: 500 });
    await page.getByLabel("Ordenar por:").selectOption("price_asc");

    await expect(page.getByText("Não foi possível carregar o catálogo")).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(nftCards(page).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("queda de conexão ao carregar o carrinho mostra erro e recupera quando a rede volta", async ({
    page,
  }) => {
    await login(page);
    await setNetworkConditions(page, { offline: true });

    // Navegação forçada (goto, não clique no link já montado): o header/tab bar já buscou
    // o carrinho na página anterior, então um clique in-app às vezes serve a resposta já
    // em cache (staleTime 30s) sem uma nova requisição — o `goto` recarrega a página com
    // um QueryClient zerado, garantindo uma busca de verdade contra a condição offline.
    await page.goto("/cart");
    await expect(page.getByText("Não foi possível carregar o carrinho")).toBeVisible({
      timeout: 20000,
    });

    await setNetworkConditions(page, { offline: false });
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("resposta 401 simulada expira a sessão durante o checkout e retoma o fluxo após novo login", async ({
    page,
  }) => {
    await login(page);
    await queueFailure(page, {
      method: "GET",
      path: "/api/wallets",
      status: 401,
      code: "UNAUTHENTICATED",
      message: "Sessão expirada",
    });

    await page.locator('a[href="/cart"]:visible').first().click();
    await page.getByRole("link", { name: "Conectar e finalizar" }).click();

    await expect(page).toHaveURL(/\/login\?redirect=/);

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/checkout\/?$/);
  });
});
