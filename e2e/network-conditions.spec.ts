import { test, expect } from "@playwright/test";
import {
  SEED_USER,
  login,
  queueDelay,
  queueFailure,
  resetMock,
  setNetworkConditions,
} from "./fixtures";

const nftCards = (page: import("@playwright/test").Page) => page.locator('a[href^="/nft/"]');

test.describe("Condições de rede simuladas (§6)", () => {
  test.beforeEach(async ({ page }) => {
    await resetMock(page);
  });

  test("catálogo mostra skeleton durante latência alta e depois os resultados", async ({ page }) => {
    await queueDelay(page, { method: "GET", path: "/api/nfts", ms: 1200 });

    await page.goto("/");
    await expect(page.getByRole("status", { name: "Carregando catálogo de NFTs" })).toBeVisible();
    await expect(nftCards(page).first()).toBeVisible({ timeout: 5000 });
  });

  test("falha 500 ao carregar o catálogo mostra erro e recupera ao tentar novamente", async ({
    page,
  }) => {
    await queueFailure(page, { method: "GET", path: "/api/nfts", status: 500 });

    await page.goto("/");
    await expect(page.getByRole("alert")).toHaveText("Não foi possível carregar o catálogo");

    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(nftCards(page).first()).toBeVisible();
  });

  test("queda de conexão ao carregar o carrinho mostra erro e recupera quando a rede volta", async ({
    page,
  }) => {
    await login(page);
    await setNetworkConditions(page, { offline: true });

    await page.goto("/cart");
    await expect(page.getByRole("alert")).toHaveText("Não foi possível carregar o carrinho");

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
      path: "/api/cart",
      status: 401,
      code: "UNAUTHENTICATED",
      message: "Sessão expirada",
    });

    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login\?redirect=/);

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/checkout\/?$/);
  });
});
