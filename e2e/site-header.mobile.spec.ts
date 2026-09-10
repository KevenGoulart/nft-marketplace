import { test, expect } from "@playwright/test";

test.describe("Menu mobile do header", () => {
  test("abre pelo botão de hambúrguer, navega e fecha", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();

    await page.getByRole("button", { name: "Abrir menu" }).click();
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav).toBeVisible();

    await nav.getByRole("link", { name: "Início" }).click();
    await expect(nav).toBeHidden();
  });

  test("fecha com Escape e devolve o foco ao botão de abrir", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Abrir menu" });
    await trigger.click();
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
