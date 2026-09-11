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
      aria-label={label}
      className="relative flex flex-1 items-center justify-center text-foreground/70 [&.active]:text-accent"
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden />
        {badge ? (
          <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {badge}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function MobileTabBar() {
  const { isAuthenticated } = useSession();
  const cartCount = useCartItemCount();

  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 h-[76px] md:hidden">
      <div className="absolute inset-x-0 -bottom-2 top-10 bg-card" aria-hidden="true" />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="30 40 414 94.95"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M312.85 40C299.09 40 286.87 48.2 281.02 60.65C273.26 77.17 256.46 88.62 237 88.62C217.54 88.62 200.74 77.18 192.98 60.65C187.13 48.2 174.9 40 161.15 40H58.93C42.95 40 30 52.95 30 68.93V134.95H444V68.93C444 52.95 431.05 40 415.07 40H312.85Z"
          className="fill-card"
        />
      </svg>

      <div className="relative flex h-full items-center px-4">
        <TabLink to="/" icon={Home} label="Início" />
        <span
          aria-disabled="true"
          aria-label="Favoritos"
          className="flex flex-1 items-center justify-center text-foreground/40"
        >
          <Heart className="size-5" aria-hidden />
        </span>

        <span className="flex-1" aria-hidden="true" />

        <TabLink to="/cart" icon={ShoppingCart} label="Carrinho" badge={cartCount} />
        <TabLink to={isAuthenticated ? "/account/profile" : "/login"} icon={User} label="Perfil" />
      </div>
    </nav>
  );
}
