import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useSession, useLogoutMutation } from "@/features/auth";
import { useCartQuery } from "@/features/cart/queries";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function useCartItemCount() {
  const { data } = useCartQuery();
  return data?.quote.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

function focusCatalogSearch() {
  requestAnimationFrame(() => {
    document.getElementById("catalog-search-input")?.focus();
  });
}

function NavLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="relative pb-1 text-base text-foreground [&.active]:text-accent [&.active]:font-bold [&.active]:border-b-[3px] [&.active]:border-accent"
    >
      {children}
    </Link>
  );
}

function OutOfScopeNavItem({ children }: { children: string }) {
  return (
    <span className="text-base text-foreground/70" aria-disabled="true">
      {children}
    </span>
  );
}

function HeaderAuthArea({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAuthenticated } = useSession();
  const navigate = useNavigate();
  const logout = useLogoutMutation();

  if (!isAuthenticated || !user) {
    return (
      <Link
        to="/login"
        onClick={onNavigate}
        className="flex h-[35px] w-[100px] items-center justify-center gap-1 rounded-md bg-primary text-base font-bold text-primary-foreground"
      >
        <img src="/icons/login.svg" alt="" className="size-5" />
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link to="/account/profile" onClick={onNavigate} className="text-base text-foreground hover:text-accent">
        {user.name}
      </Link>
      <Button
        variant="ghost"
        size="sm"
        disabled={logout.isPending}
        onClick={() => {
          onNavigate?.();
          logout.mutate(undefined, { onSettled: () => navigate({ to: "/" }) });
        }}
      >
        Sair
      </Button>
    </div>
  );
}

function CartLink({ cartCount }: { cartCount: number }) {
  return (
    <Link
      to="/cart"
      aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
      className="relative inline-flex"
    >
      <img src="/icons/cart.svg" alt="" className="size-6" />
      <span
        className={cn(
          "absolute -right-2 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground",
          cartCount === 0 && "opacity-0"
        )}
      >
        {cartCount}
      </span>
    </Link>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          className="md:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-4/5 gap-6 px-4 pb-6 pt-4 sm:max-w-xs">
        <SheetHeader className="p-0">
          <SheetTitle>KURIO</SheetTitle>
        </SheetHeader>

        <nav aria-label="Principal" className="flex flex-col gap-1">
          <SheetClose asChild>
            <Link
              to="/"
              className="rounded-md px-2 py-2.5 text-base text-foreground [&.active]:font-bold [&.active]:text-accent"
            >
              Início
            </Link>
          </SheetClose>
          <span className="px-2 py-2.5 text-base text-foreground/50" aria-disabled="true">
            Mercado
          </span>
          <span className="px-2 py-2.5 text-base text-foreground/50" aria-disabled="true">
            Criadores
          </span>
          <span className="px-2 py-2.5 text-base text-foreground/50" aria-disabled="true">
            Aprenda
          </span>
        </nav>

        <hr className="border-border" />

        <button
          type="button"
          className="flex items-center gap-3 rounded-md px-2 py-2.5 text-left text-base text-foreground"
          onClick={() => {
            close();
            navigate({ to: "/" });
            focusCatalogSearch();
          }}
        >
          <img src="/icons/search.svg" alt="" className="size-5" />
          Buscar NFTs
        </button>

        <div className="px-2">
          <HeaderAuthArea onNavigate={close} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const cartCount = useCartItemCount();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-sm font-bold tracking-[1.4px] text-foreground"
        >
          KURIO
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Principal">
          <NavLink to="/">Início</NavLink>
          <OutOfScopeNavItem>Mercado</OutOfScopeNavItem>
          <OutOfScopeNavItem>Criadores</OutOfScopeNavItem>
          <OutOfScopeNavItem>Aprenda</OutOfScopeNavItem>
        </nav>

        <div className="hidden items-center gap-7 md:flex">
          <button
            type="button"
            aria-label="Buscar NFTs"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => {
              navigate({ to: "/" });
              focusCatalogSearch();
            }}
          >
            <img src="/icons/search.svg" alt="" className="size-5" />
          </button>

          <CartLink cartCount={cartCount} />

          <HeaderAuthArea />
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <CartLink cartCount={cartCount} />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
