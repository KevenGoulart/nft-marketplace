import { test, expect, type Page } from "@playwright/test";
import { login, SEED_USER } from "./fixtures";

async function cartBadgeCount(page: Page) {
  const label = await page.locator('a[href="/cart"]:visible').first().getAttribute("aria-label");
  const match = label?.match(/Carrinho, (\d+)/);
  return match ? Number(match[1]) : 0;
}

async function warmCartCacheAndGetCount(page: Page) {
  await page.goto("/cart");
  await page.locator("ul li").first().waitFor();
  return cartBadgeCount(page);
}

test.describe("Detalhe do NFT e carrinho", () => {
  test("favoritar exige login e redireciona de volta ao NFT após autenticar", async ({ page }) => {
    await page.goto("/nft/nft-2");
    await page.getByRole("button", { name: "Favoritar" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/nft/nft-2");
  });

  test("favoritar alterna o estado visual (otimista)", async ({ page }) => {
    await login(page);
    await page.goto("/nft/nft-2");

    const favoriteButton = page.getByRole("button", { name: "Favoritar" });
    await favoriteButton.click();
    await expect(page.getByRole("button", { name: "Favoritado" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("adicionar ao carrinho atualiza o contador do header e a página do carrinho", async ({
    page,
  }) => {
    await login(page);
    const initialCount = await warmCartCacheAndGetCount(page);
    await page.goto("/nft/nft-2");

    const title = await page.getByRole("heading", { level: 1 }).innerText();
    await page.getByRole("button", { name: "COMPRAR" }).click();
    await expect(page.getByRole("button", { name: "Adicionado ✓" })).toBeVisible();

    await expect
      .poll(() => cartBadgeCount(page))
      .toBe(initialCount + 1);

    await page.goto("/cart");
    await expect(page.getByText(title).first()).toBeVisible();
  });

  test("alterar quantidade e remover item no carrinho", async ({ page }) => {
    await login(page);
    const initialCount = await warmCartCacheAndGetCount(page);
    await page.goto("/nft/nft-2");

    await page.getByRole("button", { name: "COMPRAR" }).click();
    await expect(page.getByRole("button", { name: "Adicionado ✓" })).toBeVisible();

    await page.goto("/cart");
    const nft2Row = page.locator("li", { has: page.locator('a[href="/nft/nft-2"]') }).first();
    await nft2Row.getByRole("button", { name: "Aumentar quantidade" }).click();
    await expect.poll(() => cartBadgeCount(page)).toBe(initialCount + 2);

    await nft2Row.getByRole("button", { name: /Remover .* do carrinho/ }).click();
    await expect(page.locator('a[href="/nft/nft-2"]')).toHaveCount(0);
    await expect.poll(() => cartBadgeCount(page)).toBe(initialCount);
  });
});
