import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { queryClient } from "@/app/query-client";
import { sessionQueryOptions } from "@/features/auth";
import { useRealtimeSync } from "@/features/realtime/use-realtime-sync";
import { SiteHeader } from "@/components/layout/site-header";

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

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
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
