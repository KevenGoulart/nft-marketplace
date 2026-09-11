import { test, expect } from "@playwright/test";
import { login, setScenario } from "./fixtures";

async function addNftToCartAndGoToCheckout(page: import("@playwright/test").Page) {
  await page.goto("/nft/nft-1");
  await page.getByRole("button", { name: "COMPRAR" }).click();
  await expect(page.getByRole("button", { name: "Adicionado ✓" })).toBeVisible();
  await page.goto("/checkout");
}

test.describe("Checkout", () => {
  test("compra confirmada: preenche documento, conecta carteira e recebe confirmação", async ({
    page,
  }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page);

    await page.getByLabel("Documento (CPF/ID)").fill("12345678900");
    await page.getByRole("button", { name: "Conectar" }).click();
    await expect(page.getByText(/Conectado a/)).toBeVisible({ timeout: 3000 });

    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(page).toHaveURL(/\/checkout\/confirmation\//);
    await expect(page.getByText("Processando seu pagamento...")).toBeVisible();
    await expect(page.getByText("Seus NFTs agora estão na sua carteira")).toBeVisible({
      timeout: 8000,
    });
  });

  test("compra recusada (cenário payment_refused): carrinho é preservado", async ({ page }) => {
    await login(page);
    await setScenario(page, "payment_refused");
    await addNftToCartAndGoToCheckout(page);

    await page.getByLabel("Documento (CPF/ID)").fill("12345678900");
    await page.getByRole("button", { name: "Conectar" }).click();
    await expect(page.getByText(/Conectado a/)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(page.getByText("Pagamento recusado", { exact: true })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText(/nada foi cobrado/i)).toBeVisible();

    await page.getByRole("link", { name: "Voltar ao carrinho" }).click();
    await expect(page).toHaveURL("/cart");
    await expect(page.locator('a[href="/nft/nft-1"]').first()).toBeVisible();
  });

  test("confirmar sem conectar carteira mostra erro e não avança", async ({ page }) => {
    await login(page);
    await addNftToCartAndGoToCheckout(page);

    await page.getByLabel("Documento (CPF/ID)").fill("12345678900");
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    // A mensagem de erro existe duas vezes no DOM (fluxo desktop e a barra fixa
    // exclusiva do mobile, escondida via CSS em telas largas) — `.and(':visible')`
    // garante que o matching pegue só a instância visível no viewport do teste.
    await expect(
      page
        .getByText("Conecte uma carteira para continuar.")
        .and(page.locator(":visible"))
    ).toBeVisible();
    await expect(page).toHaveURL(/\/checkout\/?$/);
  });
});
