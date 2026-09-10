import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { spawn, execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function killProcessTree(child) {
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    } catch {
    }
  } else {
    child.kill();
  }
}

const PORT = 4174;
const BASE_URL = `http://localhost:${PORT}`;
const ROUTES = ["/", "/nft/nft-1", "/cart", "/login"];
const OUT_DIR = path.resolve("lighthouse/reports");

function routeSlug(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  for (;;) {
    try {
      await fetch(url);
      return;
    } catch {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Timeout esperando o servidor em ${url}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const preview = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    { stdio: "inherit", shell: true }
  );

  try {
    await waitForServer(BASE_URL);

    const chrome = await launch({ chromeFlags: ["--headless=new"] });
    try {
      const summary = [];

      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`;
        const slug = routeSlug(route);
        console.log(`\nAuditando ${url}...`);

        const runnerResult = await lighthouse(url, {
          port: chrome.port,
          output: ["html", "json"],
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
          formFactor: "desktop",
          screenEmulation: { disabled: true },
        });

        if (!runnerResult) {
          console.error(`Falha ao auditar ${url}`);
          continue;
        }

        const [html, json] = runnerResult.report;
        await writeFile(path.join(OUT_DIR, `${slug}.html`), html);
        await writeFile(path.join(OUT_DIR, `${slug}.json`), json);

        const { categories } = runnerResult.lhr;
        summary.push({
          rota: route,
          performance: Math.round(categories.performance.score * 100),
          acessibilidade: Math.round(categories.accessibility.score * 100),
          "boas praticas": Math.round(categories["best-practices"].score * 100),
          seo: Math.round(categories.seo.score * 100),
        });
      }

      console.log("\nResumo:");
      console.table(summary);
      console.log(`Relatórios completos em ${OUT_DIR}`);
    } finally {
      await chrome.kill();
    }
  } finally {
    killProcessTree(preview);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
