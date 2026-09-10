import { test, expect, type Page } from "@playwright/test";

const nftCards = (page: Page) => page.locator('a[href^="/nft/"]');

async function gotoCatalog(page: Page) {
  await page.goto("/");
  await nftCards(page).first().waitFor();
}

test.describe("Catálogo", () => {
  test("busca filtra os resultados pelo termo digitado", async ({ page }) => {
    await gotoCatalog(page);
    const initialCount = await nftCards(page).count();
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole("searchbox", { name: "Buscar NFTs ou coleções" }).fill("zzz-nao-existe");
    await expect(page).toHaveURL(/[?&]q=zzz-nao-existe/);
    await expect(nftCards(page)).toHaveCount(0);
    await expect(page.getByText(/nenhum resultado|nenhum nft/i)).toBeVisible();
  });

  test("filtrar por coleção restringe os resultados", async ({ page }) => {
    await gotoCatalog(page);
    const initialCount = await nftCards(page).count();

    const firstCollectionButton = page.locator("aside[aria-label='Filtros'] button[aria-pressed]").first();
    await firstCollectionButton.click();

    await expect(firstCollectionButton).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/collection=/);

    const filteredCount = await nftCards(page).count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("ordenar por menor preço reordena a lista", async ({ page }) => {
    await gotoCatalog(page);
    await page.getByLabel("Ordenar por:").selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);

    await expect(async () => {
      const priceTexts = await nftCards(page).locator("span.text-accent").allInnerTexts();
      const values = priceTexts.map((text) => Number(text.replace(/[^\d.]/g, "")));
      const sorted = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sorted);
    }).toPass();
  });

  test("paginação navega para a próxima página com itens diferentes", async ({ page }) => {
    await gotoCatalog(page);
    const firstPageFirstTitle = await nftCards(page).first().innerText();

    const nextPageButton = page.getByRole("button", { name: "Próxima página" });
    await expect(nextPageButton).toBeVisible();
    await nextPageButton.click();
    await expect(page).toHaveURL(/page=2/);

    await expect(nftCards(page).first()).not.toHaveText(firstPageFirstTitle);
  });
});
