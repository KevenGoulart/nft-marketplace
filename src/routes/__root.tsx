import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { queryClient } from "@/app/query-client";
import { sessionQueryOptions } from "@/features/auth";
import { useRealtimeSync } from "@/features/realtime/use-realtime-sync";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

// Rodapé (desktop) só nas telas de mercado do Figma (Início, Detalhe, Carrinho,
// Pagamento) — perfil/carteiras/login/cadastro/confirmação não têm rodapé no design.
const FOOTER_ROUTES = new Set(["/", "/cart", "/checkout"]);

function useShowFooter() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return FOOTER_ROUTES.has(pathname) || pathname.startsWith("/nft/");
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço acessado não existe.</p>
      <Link to="/" className="text-primary underline underline-offset-4">
        Voltar para o início
      </Link>
    </div>
  );
}

function RootLayout() {
  useRealtimeSync();
  const showFooter = useShowFooter();

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      {/* tabIndex={-1}: sem isso o link "Pular para o conteúdo" move o hash da URL mas
          não o foco de teclado de verdade (main não é focável por padrão) — o próximo
          Tab reiniciaria do topo do documento em vez de continuar dentro do conteúdo. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:pb-6"
      >
        <Outlet />
      </main>
      {showFooter ? <SiteFooter /> : null}
      <MobileTabBar />
      {/* top-left no dev: é o único canto sem nada clicável em nenhum viewport — top-right
          colide com Entrar/Sair do header desktop, e qualquer canto inferior colide com a
          barra de abas mobile nova (full-width). Só existe em dev, mas o Playwright roda
          contra `npm run dev` (ver ARCHITECTURE.md), então a colisão quebrava cliques reais. */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="top-left" />}
    </div>
  );
}

export const Route = createRootRoute({
  beforeLoad: async () => {
    await queryClient.ensureQueryData(sessionQueryOptions).catch(() => null);
  },
  component: RootLayout,
  notFoundComponent: NotFound,
});
