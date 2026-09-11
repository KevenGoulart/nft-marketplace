import { test, expect } from "@playwright/test";
import { login, SEED_USER } from "./fixtures";

test.describe("Barra de abas mobile", () => {
  test("mostra a aba ativa e navega entre início e carrinho", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Início" })).toHaveClass(/active/);

    await page.getByRole("link", { name: "Carrinho" }).click();
    await expect(page).toHaveURL("/cart");

    // O carrinho tem sua própria barra fixa (resumo da compra) no lugar da MobileTabBar
    // global (ver useShowMobileTabBar em __root.tsx) — não há aba "Início" pra clicar aqui.
    await expect(page.locator("nav.fixed")).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
  });

  test("aba Perfil leva ao login sem sessão e ao perfil autenticado", async ({ page }) => {
    // Escopado à nav: agora que o rodapé também aparece no mobile, o link "Meu perfil"
    // dele casa por substring com "Perfil" no matching padrão do Playwright.
    const tabBar = page.getByRole("navigation", { name: "Principal" });

    await page.goto("/");
    await tabBar.getByRole("link", { name: "Perfil" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL((url) => url.pathname === "/");

    await tabBar.getByRole("link", { name: "Perfil" }).click();
    await expect(page).toHaveURL("/account/profile");
  });

  test("aba Favoritos (fora do escopo) fica visível, mas não navega", async ({ page }) => {
    await login(page);
    const homeUrl = page.url();

    // Barra só com ícones (igual ao Figma, sem rótulo em texto) — o nome acessível vem
    // de aria-label em vez de um nó de texto visível.
    const favoritesTab = page.locator('[aria-label="Favoritos"]');
    await expect(favoritesTab).toBeVisible();
    await favoritesTab.click();
    await expect(page).toHaveURL(homeUrl);
  });

  test("caixa de busca inline (só existe no mobile, igual ao Figma) filtra o catálogo", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href^="/nft/"]').first().waitFor();

    await page.getByRole("searchbox", { name: "Explorar coleções" }).fill("zzz-nao-existe");
    await expect(page).toHaveURL(/[?&]q=zzz-nao-existe/);
    await expect(page.getByText(/nenhum nft encontrado/i)).toBeVisible();
  });
});
