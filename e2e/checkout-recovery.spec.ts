import { test, expect } from "@playwright/test";
import { disconnectAllRealtime, login, queueDroppedResponse } from "./fixtures";

async function addNftToCartAndGoToCheckout(page: import("@playwright/test").Page, nftId = "nft-1") {
  await page.goto(`/nft/${nftId}`);
  await page.getByRole("button", { name: "COMPRAR" }).click();
  await expect(page.getByRole("button", { name: "Adicionado ✓" })).toBeVisible();
  await page.goto("/checkout");
  await page.getByLabel("Documento (CPF/ID)").fill("12345678900");
  await page.getByRole("button", { name: "Conectar" }).click();
  await expect(page.getByText(/Conectado a/)).toBeVisible({ timeout: 3000 });
}

test.describe("Recuperação do checkout (§7)", () => {
  test("clique repetido em Confirmar compra não gera pedidos duplicados", async ({ page }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page);

    const createdOrderIds: string[] = [];
    page.on("response", async (response) => {
      if (response.request().method() !== "POST" || !response.url().endsWith("/api/orders")) return;
      if (response.status() !== 201) return;
      const body = (await response.json().catch(() => null)) as { id?: string } | null;
      if (body?.id) createdOrderIds.push(body.id);
    });

    // Dispara dois cliques no mesmo tick de JS, antes que o React desabilite o botão —
    // a mesma Idempotency-Key (persistida antes do primeiro envio) protege o servidor.
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll("button")).find(
        (el) => el.textContent?.trim() === "Confirmar compra"
      );
      button?.click();
      button?.click();
    });

    await expect(page).toHaveURL(/\/checkout\/confirmation\//);
    await expect(page.getByText("Seus NFTs agora estão na sua carteira")).toBeVisible({
      timeout: 8000,
    });

    expect(new Set(createdOrderIds).size).toBeLessThanOrEqual(1);
  });

  test("timeout simulado após criar o pedido recupera o mesmo pedido pela idempotência", async ({
    page,
  }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page, "nft-2");

    await queueDroppedResponse(page, { method: "POST", path: "/api/orders" });
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/checkout\/?$/);

    // Reenvio reusa a Idempotency-Key persistida — o mock recupera o pedido já criado
    // no primeiro envio (cuja resposta foi descartada) em vez de criar um novo.
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(page).toHaveURL(/\/checkout\/confirmation\//);
    await expect(page.getByText("Seus NFTs agora estão na sua carteira")).toBeVisible({
      timeout: 8000,
    });
  });

  test("recarregar a página com um pedido pendente retoma a confirmação sem nova compra", async ({
    page,
  }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page, "nft-4");

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page).toHaveURL(/\/checkout\/confirmation\/(?<orderId>.+)/);
    const orderUrl = page.url();

    // Volta para /checkout (ex.: usuário aperta "voltar") enquanto o pedido ainda está
    // pendente — o beforeLoad deve redirecionar de volta à confirmação, nunca mostrar o
    // formulário de pagamento de novo.
    await page.goto("/checkout");
    await expect(page).toHaveURL(orderUrl);
    await expect(page.getByText("Seus NFTs agora estão na sua carteira")).toBeVisible({
      timeout: 8000,
    });
  });

  test("pedido pendente sobrevive à queda da conexão em tempo real e resolve normalmente", async ({
    page,
  }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page, "nft-6");

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page).toHaveURL(/\/checkout\/confirmation\//);
    await expect(page.getByText("Processando seu pagamento...")).toBeVisible();

    await disconnectAllRealtime(page);

    await expect(page.getByText("Seus NFTs agora estão na sua carteira")).toBeVisible({
      timeout: 10000,
    });
  });
});
