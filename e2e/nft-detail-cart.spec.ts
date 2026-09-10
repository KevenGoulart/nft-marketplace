import { test, expect, type Page } from "@playwright/test";
import { cartItemRows, login, queueFailure, SEED_USER } from "./fixtures";

async function cartBadgeCount(page: Page) {
  const label = await page.locator('a[href="/cart"]:visible').first().getAttribute("aria-label");
  const match = label?.match(/Carrinho, (\d+)/);
  return match ? Number(match[1]) : 0;
}

async function warmCartCacheAndGetCount(page: Page) {
  await page.goto("/cart");
  await cartItemRows(page).first().waitFor();
  return cartBadgeCount(page);
}

test.describe("Detalhe do NFT e carrinho", () => {
  test("acesso direto a um NFT existente carrega os dados; a um inexistente mostra estado de não encontrado", async ({
    page,
  }) => {
    await page.goto("/nft/nft-3");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "COMPRAR" })).toBeVisible();

    await page.goto("/nft/nft-nao-existe-123");
    await expect(page.getByText("NFT não encontrado")).toBeVisible();
    await expect(page.getByRole("button", { name: "COMPRAR" })).toHaveCount(0);
  });

  test("falha ao favoritar reverte o estado otimista; tentar de novo sem falha funciona", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/nft/nft-11");

    const favoriteButton = page.getByRole("button", { name: "Favoritar" });
    await expect(favoriteButton).toBeVisible();

    await queueFailure(page, { method: "POST", path: "/api/favorites/nft-11", status: 500 });
    await queueFailure(page, { method: "POST", path: "/api/favorites/nft-11", status: 500 });

    await favoriteButton.click();

    // A mutation falha (mesmo após o retry automático) e o rollback devolve o estado
    // anterior — a UI otimista pode reverter antes que o teste observe o "true"
    // intermediário, então a evidência é o estado final: nunca fica presa em "Favoritado".
    const revertedButton = page.getByRole("button", { name: "Favoritar" });
    await expect(revertedButton).toHaveAttribute("aria-pressed", "false", { timeout: 10000 });

    // Recarrega antes de tentar de novo: garante uma árvore de queries totalmente nova,
    // sem nenhuma invalidação em segundo plano da 1ª tentativa ainda em voo para competir
    // com a mutation da 2ª tentativa — e confirma que o servidor nunca aplicou o POST
    // que falhou (o estado persistido continua "não favoritado" depois do refresh).
    await page.reload();
    await expect(page.getByRole("button", { name: "Favoritar" })).toBeVisible();

    await page.getByRole("button", { name: "Favoritar" }).click();
    await expect(page.getByRole("button", { name: "Favoritado" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("carrinho de visitante persiste após refresh e é somado ao carrinho ao autenticar", async ({
    page,
  }) => {
    await page.goto("/nft/nft-8");
    const title = await page.getByRole("heading", { level: 1 }).innerText();
    await page.getByRole("button", { name: "COMPRAR" }).click();
    await expect(page.getByRole("button", { name: "Adicionado ✓" })).toBeVisible();

    await page.reload();
    await page.goto("/cart");
    await expect(page.getByText(title).first()).toBeVisible();

    await login(page);
    await page.goto("/cart");
    // Item do visitante somado aos 2 itens já sementados na conta da Ana — nenhum some.
    await expect(page.getByText(title).first()).toBeVisible();
    await expect(cartItemRows(page).first()).toBeVisible();
  });

  test("cupom: aplica desconto válido, recusa inválido/expirado e permite remover", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/cart");

    await page.getByLabel("Código promocional").fill("CODIGO-INEXISTENTE");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    await page.getByLabel("Código promocional").fill("EXPIRADA5");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    await page.getByLabel("Código promocional").fill("BEMVINDO10");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await expect(page.getByText("BEMVINDO10")).toBeVisible();

    await page.getByRole("button", { name: "Remover cupom" }).click();
    await expect(page.getByText("BEMVINDO10")).toHaveCount(0);
  });

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
