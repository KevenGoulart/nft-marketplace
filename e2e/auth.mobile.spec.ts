import { test, expect } from "@playwright/test";
import { SEED_USER } from "./fixtures";

test.describe("Login e cadastro em tela cheia no mobile", () => {
  test("/login é uma tela própria, sem modal nem barra de abas, e loga", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("nav.fixed")).toHaveCount(0);
    await expect(page.getByText("KURIO")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL((url) => url.pathname === "/");
  });

  test("link 'Crie uma conta' navega de verdade pra /signup, e o cadastro funciona", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Novo na Kurio? Crie uma conta" }).click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Criar perfil de colecionador" })).toBeVisible();

    const email = `teste-mobile-${Date.now()}@kurio.test`;
    await page.getByLabel("Nome completo").fill("Colecionador Mobile");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("senhaforte123");
    await page.getByLabel("Confirmar senha").fill("senhaforte123");
    await page.getByRole("button", { name: "Criar perfil" }).click();

    await page.waitForURL((url) => url.pathname === "/");
  });

  test("Esc não navega pra fora da tela (sem o listener de fechar do modal desktop)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/login/);
  });
});
