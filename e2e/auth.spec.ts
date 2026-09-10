import { test, expect } from "@playwright/test";
import { SEED_USER, login } from "./fixtures";

test.describe("Autenticação", () => {
  test("visitante é redirecionado para /login ao tentar acessar rota protegida, e volta para ela após entrar", async ({
    page,
  }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill(SEED_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/checkout");
  });

  test("login com credenciais inválidas mostra erro e mantém na página", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(SEED_USER.email);
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("cadastro de nova conta autentica e leva ao início", async ({ page }) => {
    const email = `teste-${Date.now()}@kurio.test`;

    await page.goto("/signup");
    await page.getByLabel("Nome completo").fill("Novo Colecionador");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("senhaforte123");
    await page.getByLabel("Confirmar senha").fill("senhaforte123");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await page.waitForURL((url) => url.pathname === "/");
    await expect(page.getByRole("link", { name: "Novo Colecionador" })).toBeVisible();
  });

  test("login e logout", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("link", { name: SEED_USER.name })).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  });
});
