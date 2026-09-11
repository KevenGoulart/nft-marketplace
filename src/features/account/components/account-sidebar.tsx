import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, ShoppingBag, Heart, Activity, Download, AlertTriangle, LogOut, User } from "lucide-react";
import { useLogoutMutation } from "@/features/auth";
import { cn } from "@/lib/utils";

const OUT_OF_SCOPE_ITEMS = [
  { icon: ShoppingBag, label: "Atividade" },
  { icon: Heart, label: "Lista de interesse" },
  { icon: Activity, label: "Ofertas" },
  { icon: Download, label: "Arquivos baixados" },
  { icon: AlertTriangle, label: "Suporte" },
];

export function AccountSidebar({ active }: { active: "profile" | "wallets" }) {
  const navigate = useNavigate();
  const logout = useLogoutMutation();

  return (
    <nav
      aria-label="Menu da conta"
      className="flex w-full shrink-0 flex-col items-start gap-1 rounded-md bg-card py-2 md:w-[310px]"
    >
      <p className="w-full p-2.5 text-center text-lg font-bold text-foreground">Meu perfil</p>

      <Link
        to="/account/profile"
        className={cn(
          "flex w-full items-center gap-4 border-l-[6px] px-4 py-3 text-[15px]",
          active === "profile"
            ? "border-primary text-accent"
            : "border-transparent text-accent/80 hover:text-accent"
        )}
      >
        <User className="size-[18px]" aria-hidden />
        Dados do perfil
      </Link>

      <Link
        to="/account/wallets"
        className={cn(
          "flex w-full items-center gap-4 border-l-[6px] px-4 py-3 text-[15px]",
          active === "wallets"
            ? "border-primary text-accent"
            : "border-transparent text-accent/80 hover:text-accent"
        )}
      >
        <MapPin className="size-[18px]" aria-hidden />
        Carteiras
      </Link>

      {OUT_OF_SCOPE_ITEMS.map(({ icon: Icon, label }) => (
        <span
          key={label}
          aria-disabled="true"
          className="flex w-full items-center gap-4 border-l-[6px] border-transparent px-4 py-3 text-[15px] text-foreground/50"
        >
          <Icon className="size-[18px]" aria-hidden />
          {label}
        </span>
      ))}

      <hr className="my-1 w-full border-border" />

      <button
        type="button"
        disabled={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSettled: () => navigate({ to: "/" }) })}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-[15px] font-bold text-accent disabled:cursor-not-allowed"
      >
        <LogOut className="size-5" aria-hidden />
        Sair
      </button>
    </nav>
  );
}
