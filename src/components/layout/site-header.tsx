import { useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useSession, useLogoutMutation } from "@/features/auth";
import { useAuthModal } from "@/features/auth/components/auth-modal-context";
import { useCartQuery } from "@/features/cart/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function useCartItemCount() {
  const { data } = useCartQuery();
  return data?.quote.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

function NavLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="flex h-full items-center border-b-[3px] border-transparent text-base text-foreground [&.active]:border-accent [&.active]:font-bold [&.active]:text-accent"
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
  const { open } = useAuthModal();

  if (!isAuthenticated || !user) {
    return (
      <Link
        to="/login"
        onClick={(event) => {
          if (event.defaultPrevented || event.button !== 0) return;
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onNavigate?.();
          open("login");
        }}
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

function HeaderSearch() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function open() {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function close() {
    setExpanded(false);
    setDraft("");
  }

  function submit() {
    const q = draft.trim() || undefined;
    if (pathname === "/") {
      navigate({ to: "/", search: (prev) => ({ ...prev, q, page: 1 }) });
    } else {
      navigate({ to: "/", search: { q, page: 1, sort: "recent" } });
    }
    close();
  }

  if (!expanded) {
    return (
      <button
        type="button"
        aria-label="Buscar NFTs"
        className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
        onClick={open}
      >
        <img src="/icons/search.svg" alt="" className="size-5" />
      </button>
    );
  }

  return (
    <form
      role="search"
      className="flex items-center"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Input
        ref={inputRef}
        type="search"
        aria-label="Buscar NFTs ou coleções"
        placeholder="Buscar NFTs ou coleções"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (!draft.trim()) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        className="h-9 w-56"
      />
    </form>
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

export function SiteHeader() {
  const cartCount = useCartItemCount();

  return (
    <header className="hidden bg-background md:block">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-[70px] items-center justify-between border-b border-border">
          <Link
            to="/"
            className="text-sm font-bold tracking-[1.4px] text-foreground"
          >
            KURIO
          </Link>

          <nav className="hidden items-center gap-10 self-stretch md:flex" aria-label="Principal">
            <NavLink to="/">Início</NavLink>
            <OutOfScopeNavItem>Mercado</OutOfScopeNavItem>
            <OutOfScopeNavItem>Criadores</OutOfScopeNavItem>
            <OutOfScopeNavItem>Aprenda</OutOfScopeNavItem>
          </nav>

          <div className="hidden items-center gap-7 md:flex">
            <HeaderSearch />

            <CartLink cartCount={cartCount} />

            <HeaderAuthArea />
          </div>
        </div>
      </div>
    </header>
  );
}
