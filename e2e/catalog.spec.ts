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

    // No desktop a busca só existe como ícone no header (igual ao Figma) — clicar
    // expande um campo de texto (HeaderSearch em site-header.tsx).
    await page.getByRole("button", { name: "Buscar NFTs" }).click();
    await page.getByRole("searchbox", { name: "Buscar NFTs ou coleções" }).fill("zzz-nao-existe");
    await page.keyboard.press("Enter");
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

  test("filtros combinados persistem na URL, sobrevivem a refresh e respondem ao histórico", async ({
    page,
  }) => {
    await gotoCatalog(page);

    const firstCollectionButton = page
      .locator("aside[aria-label='Filtros'] button[aria-pressed]")
      .first();
    await firstCollectionButton.click();
    await expect(page).toHaveURL(/collection=/);
    const collectionOnlyUrl = page.url();

    await page.getByLabel("Ordenar por:").selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);
    await expect(page).toHaveURL(/collection=/);
    const combinedUrl = page.url();

    await page.reload();
    await expect(page).toHaveURL(combinedUrl);
    await expect(nftCards(page).first()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(collectionOnlyUrl);

    await page.goForward();
    await expect(page).toHaveURL(combinedUrl);
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

  test("trocar de página ou filtro preserva a posição de rolagem (não pula pro topo)", async ({
    page,
  }) => {
    await gotoCatalog(page);

    const nextPageButton = page.getByRole("button", { name: "Próxima página" });
    await nextPageButton.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(200);

    await nextPageButton.click();
    await expect(page).toHaveURL(/page=2/);

    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(200);
  });

  test("Diário da Cunhagem aparece na home, mas não navega a lugar nenhum (fora do escopo)", async ({
    page,
  }) => {
    await gotoCatalog(page);

    const section = page.locator("section", {
      has: page.getByRole("heading", { name: "Diário da Cunhagem" }),
    });
    await expect(section).toBeVisible();
    await expect(section.getByText("Como funciona a propriedade de NFTs")).toBeVisible();

    // Nada dentro da seção é link/botão — clicar não deve navegar.
    await expect(section.locator("a, button")).toHaveCount(0);
    const urlBefore = page.url();
    await section.getByText("Ler mais").first().click();
    await expect(page).toHaveURL(urlBefore);
  });
});
