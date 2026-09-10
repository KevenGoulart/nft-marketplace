import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { login } from "./fixtures";

test.describe("Acessibilidade (axe-core)", () => {
  const publicRoutes = ["/", "/nft/nft-1", "/login", "/signup"];

  for (const route of publicRoutes) {
    test(`sem violações em ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.locator("h1").first().waitFor();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("sem violações nas rotas autenticadas (carrinho, checkout, perfil, carteiras)", async ({
    page,
  }) => {
    await login(page);

    for (const route of ["/cart", "/account/profile", "/account/wallets"]) {
      await page.goto(route);
      await page.locator("h1").first().waitFor();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `violações em ${route}`).toEqual([]);
    }
  });
});
