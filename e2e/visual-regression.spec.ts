import { test, expect, type Page } from "@playwright/test";
import { cartItemRows, login } from "./fixtures";

/**
 * Baselines versionadas de início/detalhe/carrinho/pagamento, nas três larguras
 * mínimas exigidas pelo enunciado (§8: 390/768/1440). Dados 100% determinísticos
 * (seed sem Math.random/Date.now — ver src/mocks/db/seed-nfts.ts) e sem eventos de
 * tempo real disparados, para o snapshot ficar estável entre execuções.
 */

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

// Botões flutuantes de devtools (Router/Query) só existem no servidor de dev usado pelo
// Playwright — não fazem parte da UI de produção. Mascarados para o baseline refletir o
// que o usuário final vê.
function devtoolsMask(page: Page) {
  return [
    page.getByRole("button", { name: "Open TanStack Router Devtools" }),
    page.getByRole("button", { name: "Open Tanstack query devtools" }),
  ];
}

async function gotoCatalog(page: Page) {
  await page.goto("/");
  await page.locator('a[href^="/nft/"]').first().waitFor();
}

async function gotoDetail(page: Page) {
  await page.goto("/nft/nft-1");
  await page.getByRole("heading", { level: 1 }).waitFor();
}

async function gotoCart(page: Page) {
  await login(page);
  await page.goto("/cart");
  await cartItemRows(page).first().waitFor();
}

async function gotoCheckout(page: Page) {
  await login(page);
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Confirmar compra" }).waitFor();
}

for (const viewport of VIEWPORTS) {
  test.describe(`Regressão visual @ ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`início — ${viewport.name}`, async ({ page }) => {
      await gotoCatalog(page);
      await expect(page).toHaveScreenshot(`inicio-${viewport.name}.png`, {
        fullPage: true,
        mask: devtoolsMask(page),
      });
    });

    test(`detalhe do NFT — ${viewport.name}`, async ({ page }) => {
      await gotoDetail(page);
      await expect(page).toHaveScreenshot(`detalhe-${viewport.name}.png`, {
        fullPage: true,
        mask: devtoolsMask(page),
      });
    });

    test(`carrinho — ${viewport.name}`, async ({ page }) => {
      await gotoCart(page);
      await expect(page).toHaveScreenshot(`carrinho-${viewport.name}.png`, {
        fullPage: true,
        mask: devtoolsMask(page),
      });
    });

    test(`pagamento — ${viewport.name}`, async ({ page }) => {
      await gotoCheckout(page);
      await expect(page).toHaveScreenshot(`pagamento-${viewport.name}.png`, {
        fullPage: true,
        mask: devtoolsMask(page),
      });
    });
  });
}
