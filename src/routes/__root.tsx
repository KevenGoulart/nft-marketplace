import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { queryClient } from "@/app/query-client";
import { sessionQueryOptions } from "@/features/auth";
import { useRealtimeSync } from "@/features/realtime/use-realtime-sync";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { AuthModalProvider, useAuthModal } from "@/features/auth/components/auth-modal-context";
import { AuthModalOverlay } from "@/features/auth/components/auth-modal-overlay";
import { cn } from "@/lib/utils";

const FOOTER_ROUTES = new Set(["/", "/cart", "/checkout"]);

function useShowFooter() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return FOOTER_ROUTES.has(pathname) || pathname.startsWith("/nft/");
}

const MOBILE_OWN_BOTTOM_BAR_EXTRA_CLEARANCE: Record<string, number> = {
  "/cart": 212, // resumo da compra + cupom (~290px de barra fixa)
};

const MOBILE_HIDE_FOOTER_ROUTES = new Set(["/checkout"]);

const MOBILE_HIDE_TAB_BAR_ROUTES = new Set(["/checkout", "/login", "/signup"]);

function isNftDetailRoute(pathname: string) {
  return pathname.startsWith("/nft/");
}

function useShowMobileTabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    !isNftDetailRoute(pathname) &&
    !(pathname in MOBILE_OWN_BOTTOM_BAR_EXTRA_CLEARANCE) &&
    !MOBILE_HIDE_TAB_BAR_ROUTES.has(pathname)
  );
}

function useMobileBottomBarExtraClearance() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (isNftDetailRoute(pathname)) return 52;
  return MOBILE_OWN_BOTTOM_BAR_EXTRA_CLEARANCE[pathname] ?? 0;
}

function useHideFooterOnMobile() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return MOBILE_HIDE_FOOTER_ROUTES.has(pathname);
}

function useMainMobileBottomPadding() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return MOBILE_HIDE_TAB_BAR_ROUTES.has(pathname) ? "pb-6" : "pb-20";
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
  return (
    <AuthModalProvider>
      <RootLayoutInner />
    </AuthModalProvider>
  );
}

function RootLayoutInner() {
  useRealtimeSync();
  const showFooter = useShowFooter();
  const showMobileTabBar = useShowMobileTabBar();
  const extraClearance = useMobileBottomBarExtraClearance();
  const hideFooterOnMobile = useHideFooterOnMobile();
  const mainMobileBottomPadding = useMainMobileBottomPadding();
  const { openTab } = useAuthModal();

  return (
    <>
      <div className="flex min-h-svh flex-col" {...(openTab ? { inert: true } : {})}>
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:pb-6",
            mainMobileBottomPadding
          )}
        >
          <Outlet />
        </main>
        {showFooter ? (
          <SiteFooter className={hideFooterOnMobile ? "hidden md:block" : undefined} />
        ) : null}
        {extraClearance > 0 && showFooter ? (
          <div style={{ height: extraClearance }} className="md:hidden" aria-hidden="true" />
        ) : null}
        {showMobileTabBar ? <MobileTabBar /> : null}
        {import.meta.env.DEV && <TanStackRouterDevtools position="top-left" />}
      </div>
      <AuthModalOverlay />
    </>
  );
}

export const Route = createRootRoute({
  beforeLoad: async () => {
    await queryClient.ensureQueryData(sessionQueryOptions).catch(() => null);
  },
  component: RootLayout,
  notFoundComponent: NotFound,
});
