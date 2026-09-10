import { Link } from "@tanstack/react-router";
import { Heart, Home, ShoppingCart, User } from "lucide-react";
import { useSession } from "@/features/auth";
import { useCartQuery } from "@/features/cart/queries";

function useCartItemCount() {
  const { data } = useCartQuery();
  return data?.quote.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

function TabLink({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      className="relative flex flex-1 flex-col items-center gap-1 py-2 text-foreground/70 [&.active]:text-accent"
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden />
        {badge ? (
          <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}

export function MobileTabBar() {
  const { isAuthenticated } = useSession();
  const cartCount = useCartItemCount();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden"
    >
      <TabLink to="/" icon={Home} label="Início" />
      {/* Lista de interesse (favoritos) não é uma tela do escopo do desafio — visível
          para paridade com o Figma, mas sem destino, no mesmo padrão dos itens fora de
          escopo da sidebar da conta (ver account-sidebar.tsx). */}
      <span
        aria-disabled="true"
        className="flex flex-1 flex-col items-center gap-1 py-2 text-foreground/40"
      >
        <Heart className="size-5" aria-hidden />
        <span className="text-[11px]">Favoritos</span>
      </span>
      <TabLink to="/cart" icon={ShoppingCart} label="Carrinho" badge={cartCount} />
      <TabLink
        to={isAuthenticated ? "/account/profile" : "/login"}
        icon={User}
        label="Perfil"
      />
    </nav>
  );
}
