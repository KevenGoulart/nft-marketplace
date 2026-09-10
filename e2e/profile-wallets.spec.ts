import { test, expect } from "@playwright/test";
import { login, SEED_USER } from "./fixtures";

test.describe("Perfil e carteiras", () => {
  test("atualizar nome de exibição persiste e reflete no header", async ({ page }) => {
    await login(page);
    await page.goto("/account/profile");

    await page.getByLabel("Nome de exibição").fill("Ana Colecionadora");
    await page.getByRole("button", { name: "Salvar" }).first().click();

    await expect(page.getByRole("status")).toHaveText("Dados salvos com sucesso.");
    await expect(page.getByRole("link", { name: "Ana Colecionadora" })).toBeVisible();
  });

  test("trocar senha permite logar com a nova credencial", async ({ page }) => {
    await login(page);
    await page.goto("/account/profile");

    await page.getByLabel("Senha atual").fill(SEED_USER.password);
    await page.getByLabel("Nova senha", { exact: true }).fill("novaSenha123");
    await page.getByLabel("Confirmar nova senha").fill("novaSenha123");
    await page.getByRole("button", { name: "Salvar" }).last().click();

    await expect(page.getByRole("status")).toHaveText("Senha alterada com sucesso.");

    await page.getByRole("banner").getByRole("button", { name: "Sair" }).click();
    await login(page, SEED_USER.email, "novaSenha123");
    await expect(page.getByRole("link", { name: SEED_USER.name })).toBeVisible();
  });

  test("cadastrar carteira secundária e editá-la", async ({ page }) => {
    await login(page);
    await page.goto("/account/wallets");

    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByLabel("Nome da carteira").fill("Carteira do dia a dia");
    await page.getByLabel("Endereço da carteira").fill("0xC3d4E5f6A1B2c3D4e5F6A1b2C3d4E5f6A1B2c3D4");
    await page.getByRole("button", { name: "Salvar carteira" }).click();

    await expect(page.getByText("Carteira do dia a dia")).toBeVisible();

    await page.getByRole("button", { name: "Editar" }).last().click();
    await page.getByLabel("Nome da carteira").fill("Carteira secundária editada");
    await page.getByRole("button", { name: "Salvar carteira" }).click();

    await expect(page.getByText("Carteira secundária editada")).toBeVisible();
  });
});
