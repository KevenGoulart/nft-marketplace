import type { Page } from "@playwright/test";

export const SEED_USER = {
  name: "Ana Souza",
  email: "ana@kurio.test",
  password: "kurio123!",
};

export async function login(page: Page, email = SEED_USER.email, password = SEED_USER.password) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

/**
 * Linhas de item do carrinho — nunca `page.locator("ul li")` sozinho: o rodapé (§ figma
 * fidelity pass) também renderiza `<ul><li>` para suas colunas de links, e como ele faz
 * parte do layout estático (não depende dos dados do carrinho ainda carregarem), um
 * `"ul li").first().waitFor()` genérico pode resolver no link do rodapé antes dos itens
 * reais do carrinho existirem. Escopar pelo link para `/nft/` evita a ambiguidade.
 */
export function cartItemRows(page: Page) {
  return page.locator('li:has(a[href^="/nft/"])');
}


export async function resetMock(page: Page) {
  await page.evaluate(() => fetch("/api/mock/reset", { method: "POST" }));
}

export async function setScenario(page: Page, scenario: "default" | "payment_refused") {
  await page.evaluate(
    (s) =>
      fetch("/api/mock/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: s }),
      }),
    scenario
  );
}

async function postJson(page: Page, path: string, body: unknown) {
  await page.evaluate(
    ({ path, body }) =>
      fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    { path, body }
  );
}

export async function setNetworkConditions(
  page: Page,
  conditions: { latencyMs?: { min: number; max: number } | null; offline?: boolean }
) {
  await postJson(page, "/api/mock/network", conditions);
}

export async function queueFailure(
  page: Page,
  failure: { method: string; path: string; status: number; code?: string; message?: string }
) {
  await postJson(page, "/api/mock/network/fail-next", failure);
}

export async function queueDelay(page: Page, delay: { method: string; path: string; ms: number }) {
  await postJson(page, "/api/mock/network/delay-next", delay);
}

export async function queueDroppedResponse(page: Page, target: { method: string; path: string }) {
  await postJson(page, "/api/mock/network/drop-next", target);
}

export async function resetNetworkConditions(page: Page) {
  await page.evaluate(() => fetch("/api/mock/network/reset", { method: "POST" }));
}

export async function simulateNftUpdate(
  page: Page,
  nftId: string,
  patch: { priceEth?: string; editionsAvailable?: number }
) {
  await postJson(page, `/api/mock/nfts/${nftId}/simulate-update`, patch);
}

export async function emitRawNftUpdate(
  page: Page,
  event: {
    nftId: string;
    version: number;
    priceEth: string;
    previousPriceEth: string | null;
    editionsAvailable: number;
  }
) {
  await postJson(page, "/api/mock/realtime/emit-nft-update", event);
}

export async function disconnectAllRealtime(page: Page) {
  await page.evaluate(() => fetch("/api/mock/realtime/disconnect-all", { method: "POST" }));
}
