import { test, expect } from "@playwright/test";

test.describe("Navegação por teclado (§8)", () => {
  test("skip link aparece com Tab e move o foco para o conteúdo principal", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href^="/nft/"]').first().waitFor();

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("enviar o cadastro vazio por teclado mostra erros de validação associados aos campos", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel("Nome completo").focus();
    await page.keyboard.press("Enter");

    const emailInput = page.getByLabel("E-mail");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    const describedBy = await emailInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });
});
