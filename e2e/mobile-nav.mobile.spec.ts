import { test, expect } from "@playwright/test";
import { login, SEED_USER } from "./fixtures";

test.describe("Barra de abas mobile", () => {
  test("mostra a aba ativa e navega entre início e carrinho", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Início" })).toHaveClass(/active/);

    await page.getByRole("link", { name: "Carrinho" }).click();
    await expect(page).toHaveURL("/cart");

    await page.getByRole("link", { name: "Início" }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
  });

  test("aba Perfil leva ao login sem sessão e ao perfil autenticado", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Perfil" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL((url) => url.pathname === "/");

    await page.getByRole("link", { name: "Perfil" }).click();
    await expect(page).toHaveURL("/account/profile");
  });

  test("aba Favoritos (fora do escopo) fica visível, mas não navega", async ({ page }) => {
    await login(page);
    const homeUrl = page.url();

    const favoritesTab = page.getByText("Favoritos");
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
