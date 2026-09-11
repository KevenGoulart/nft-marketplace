import { test, expect } from "@playwright/test";
import { emitRawNftUpdate, login, queueDelay, simulateNftUpdate } from "./fixtures";

async function addNftToCartAndGoToCheckout(page: import("@playwright/test").Page, nftId: string) {
  await page.goto(`/nft/${nftId}`);
  await page.getByRole("button", { name: "COMPRAR" }).click();
  await expect(page.getByRole("button", { name: "Adicionado ✓" })).toBeVisible();
  await page.goto("/checkout");
  await page.getByLabel("Documento (CPF/ID)").fill("12345678900");
  await page.getByRole("button", { name: "Conectar" }).click();
  await expect(page.getByText(/Conectado a/)).toBeVisible({ timeout: 3000 });
}

test.describe("Tempo real via Socket.IO (§7)", () => {
  test("preço muda com o item no carrinho: avisa, atualiza o resumo e bloqueia confirmação com cotação desatualizada", async ({
    page,
  }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page, "nft-7");

    // Atrasa só a resposta de POST /orders: o cliente já enviou a cotação vigente no
    // momento do clique, mas o "servidor" só processa depois que o preço mudou no
    // meio do caminho — exatamente a janela de corrida que o enunciado descreve.
    await queueDelay(page, { method: "POST", path: "/api/orders", ms: 1500 });
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await simulateNftUpdate(page, "nft-7", { priceEth: "3.5" });

    await expect(
      page.getByText(
        "O preço ou a disponibilidade de um item no seu carrinho mudou. Revise antes de continuar."
      )
    ).toBeVisible();

    // Essa mensagem existe duas vezes no DOM (fluxo desktop e a barra fixa exclusiva do
    // mobile, escondida via CSS em telas largas) — `.and(':visible')` garante que o
    // matching pegue só a instância visível no viewport do teste.
    await expect(
      page
        .getByText(
          "O preço, o cupom ou a disponibilidade mudaram. Revise o resumo abaixo e confirme novamente."
        )
        .and(page.locator(":visible"))
    ).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/checkout\/?$/);
  });

  test("eventos duplicados ou antigos não regridem o preço exibido, mas um evento mais novo é aplicado", async ({
    page,
  }) => {
    const nftId = "nft-9";
    await page.goto(`/nft/${nftId}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const detail = await page.evaluate(
      (id) => fetch(`/api/nfts/${id}`).then((r) => r.json()),
      nftId
    );

    // Preço aparece duas vezes no DOM (layout desktop e a barra de compra exclusiva do
    // mobile, escondida via CSS em telas largas) — `.and(':visible')` garante que o
    // matching pegue só a instância realmente visível no viewport do teste.
    const visiblePrice = (text: string) =>
      page.getByText(text, { exact: true }).and(page.locator(":visible"));

    await expect(visiblePrice(`${detail.priceEth} ETH`)).toBeVisible();

    // Duplicata: mesma versão já conhecida.
    await emitRawNftUpdate(page, {
      nftId,
      version: detail.version,
      priceEth: "999",
      previousPriceEth: detail.priceEth,
      editionsAvailable: detail.editionsAvailable,
    });
    await expect(page.getByText("999 ETH")).toHaveCount(0);

    // Evento antigo: versão anterior à já conhecida.
    await emitRawNftUpdate(page, {
      nftId,
      version: detail.version - 1,
      priceEth: "111",
      previousPriceEth: detail.priceEth,
      editionsAvailable: detail.editionsAvailable,
    });
    await expect(page.getByText("111 ETH")).toHaveCount(0);
    await expect(visiblePrice(`${detail.priceEth} ETH`)).toBeVisible();

    // Evento genuinamente mais novo: deve ser aplicado normalmente.
    await emitRawNftUpdate(page, {
      nftId,
      version: detail.version + 1,
      priceEth: "4.2",
      previousPriceEth: detail.priceEth,
      editionsAvailable: detail.editionsAvailable,
    });
    await expect(visiblePrice("4.2 ETH")).toBeVisible();
  });
});
