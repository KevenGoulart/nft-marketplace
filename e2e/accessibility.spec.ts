import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { login } from "./fixtures";

// O devtools do TanStack Router (só existe em `npm run dev`, nunca no build de produção
// que o Lighthouse audita) renderiza seu próprio <footer>, colidindo com o <footer> real
// do app (rodapé do Figma) na regra "landmark-no-duplicate-contentinfo". `.exclude()` não
// resolve: essa regra específica varre `document.querySelectorAll` diretamente e ignora o
// contexto de exclusão do axe (confirmado isolando o node via debug). Como a causa é uma
// ferramenta de dev que não existe para o usuário real, a regra é desligada aqui — nunca
// use este builder para nada além destas duas suítes, e não desligue outras regras nele.
function createAxeBuilder(page: Page) {
  return new AxeBuilder({ page }).disableRules(["landmark-no-duplicate-contentinfo"]);
}

test.describe("Acessibilidade (axe-core)", () => {
  const publicRoutes = ["/", "/nft/nft-1", "/login", "/signup"];

  for (const route of publicRoutes) {
    test(`sem violações em ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.locator("h1").first().waitFor();
      const results = await createAxeBuilder(page).analyze();
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
      const results = await createAxeBuilder(page).analyze();
      expect(results.violations, `violações em ${route}`).toEqual([]);
    }
  });
});
