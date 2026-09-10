import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Users, Wallet } from "lucide-react";
import { useSession } from "@/features/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FOOTER_COLLECTIONS = ["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"];

const HELP_LINKS = [
  "Central de ajuda",
  "Como comprar NFTs",
  "Carteira e segurança",
  "Política de mercado",
  "Denunciar item",
];

const PROFILE_LINKS = ["Minha coleção", "Atividade", "Estúdio do criador", "Lista de interesse"];

const SOCIAL_LINKS = ["Facebook", "Instagram", "Twitter", "LinkedIn"];

function OutOfScopeLink({ children }: { children: string }) {
  return (
    <span aria-disabled="true" className="text-secondary-foreground/70">
      {children}
    </span>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterHighlight({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Wallet;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="text-sm text-secondary-foreground">{description}</p>
    </div>
  );
}

export function SiteFooter() {
  const { isAuthenticated } = useSession();

  return (
    <footer aria-label="Rodapé" className="hidden border-t border-border bg-card md:block">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="grid grid-cols-1 gap-8 border-b border-border pb-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterHighlight
            icon={Wallet}
            title="Segurança da carteira"
            description="Proteja seus ativos e transações com verificação de carteira ponta a ponta."
          />
          <FooterHighlight
            icon={Users}
            title="Criadores em destaque"
            description="Conheça artistas e comunidades que moldam a cultura digital."
          />
          <FooterHighlight
            icon={Bell}
            title="Alertas de lançamento"
            description="Receba avisos de lançamentos, coleções e listas de acesso."
          />

          <form
            aria-label="Inscrição de novidades (indisponível nesta demonstração)"
            className="flex flex-col gap-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <p className="text-sm font-bold text-foreground">Antecipe-se ao próximo lançamento</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Digite seu e-mail..."
                disabled
                aria-label="E-mail para novidades"
                className="h-10"
              />
              <Button type="submit" disabled className="h-10 shrink-0">
                Enviar
              </Button>
            </div>
            <p className="text-xs text-secondary-foreground">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterColumn title="Meu perfil">
            <li>
              <Link to={isAuthenticated ? "/account/profile" : "/login"} className="hover:text-accent">
                Meu perfil
              </Link>
            </li>
            {PROFILE_LINKS.map((label) => (
              <li key={label}>
                <OutOfScopeLink>{label}</OutOfScopeLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Central de ajuda">
            {HELP_LINKS.map((label) => (
              <li key={label}>
                <OutOfScopeLink>{label}</OutOfScopeLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Coleções">
            {FOOTER_COLLECTIONS.map((collection) => (
              <li key={collection}>
                <Link
                  to="/"
                  search={{ collection, page: 1 }}
                  className="hover:text-accent"
                >
                  {collection}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Redes sociais">
            {SOCIAL_LINKS.map((label) => (
              <li key={label}>
                <OutOfScopeLink>{label}</OutOfScopeLink>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
          <p className="text-xs text-secondary-foreground">
            Carteiras compatíveis:{" "}
            <span className="text-secondary-foreground/80">MetaMask · WalletConnect · Coinbase Wallet</span>
          </p>
          <p className="text-xs text-tertiary">© 2026 Kurio. Propriedade digital para todos.</p>
        </div>
      </div>
    </footer>
  );
}
