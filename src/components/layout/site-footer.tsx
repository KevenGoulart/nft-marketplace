import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Briefcase, Camera, MessageCircle, Play, Share2 } from "lucide-react";
import { useSession } from "@/features/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOOTER_COLLECTIONS = ["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"];

const HELP_LINKS = [
  "Central de ajuda",
  "Como comprar NFTs",
  "Carteira e segurança",
  "Política do mercado",
  "Denunciar item",
];

const PROFILE_LINKS = ["Minha coleção", "Atividade", "Estúdio do criador", "Lista de interesse"];

const HIGHLIGHTS = [
  {
    letter: "W",
    title: "Segurança da carteira",
    description: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    letter: "C",
    title: "Criadores em destaque",
    description: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    letter: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

const SOCIAL_LINKS = [
  { label: "Facebook", icon: Share2, className: "text-[#1877F2]" },
  { label: "Instagram", icon: Camera, className: "text-[#C13584]" },
  { label: "Twitter", icon: MessageCircle, className: "text-[#1DA1F2]" },
  { label: "LinkedIn", icon: Briefcase, className: "text-[#0A66C2]" },
  { label: "YouTube", icon: Play, className: "text-[#FF0000]" },
];

function OutOfScopeLink({ children }: { children: string }) {
  return (
    <span aria-disabled="true">
      {children}
    </span>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-start gap-2 text-foreground">
      <p className="text-lg font-bold leading-[16px]">{title}</p>
      <ul className="flex flex-col text-sm font-normal leading-[30px] text-foreground/85">
        {children}
      </ul>
    </div>
  );
}

function FooterHighlight({
  letter,
  title,
  description,
}: {
  letter: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-row items-center gap-4 px-4 sm:flex-col sm:items-start sm:gap-3">
      <span className="flex size-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
        {letter}
      </span>
      <div className="flex min-w-0 flex-col gap-1 sm:gap-3">
        <p className="text-[15px] leading-tight font-bold text-foreground sm:text-[17px] sm:leading-[16px] sm:whitespace-nowrap">
          {title}
        </p>
        <p className="text-sm leading-[22px] text-secondary-foreground sm:w-[204px] sm:max-w-full">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  const { isAuthenticated } = useSession();

  return (
    <footer aria-label="Rodapé" className={cn("pb-20 md:pb-0", className)}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 rounded-t-xl bg-card p-5 sm:gap-8 sm:p-8 lg:flex-row lg:gap-4 lg:divide-x lg:divide-primary">
          {HIGHLIGHTS.map((highlight) => (
            <FooterHighlight key={highlight.title} {...highlight} />
          ))}

          <form
            aria-label="Inscrição de novidades (indisponível nesta demonstração)"
            className="flex min-w-0 flex-1 flex-col gap-4 px-4 lg:flex-[1.6]"
            onSubmit={(event) => event.preventDefault()}
          >
            <p className="text-lg font-bold leading-[16px] text-foreground">
              Antecipe-se ao próximo lançamento
            </p>
            <div className="flex h-10 items-center justify-between rounded-md bg-secondary pl-3">
              <Input
                type="email"
                placeholder="digite seu e-mail..."
                disabled
                aria-label="E-mail para novidades"
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-sm leading-[16px] text-foreground shadow-none placeholder:text-tertiary focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled
                className="h-full shrink-0 rounded-l-none px-4 text-[18px] font-bold leading-[16px]"
              >
                Enviar
              </Button>
            </div>
            <p className="text-[13px] leading-[22px] text-secondary-foreground">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary px-5 py-5 sm:gap-6 sm:px-8 sm:py-6">
          <p className="text-sm font-bold tracking-[1.4px] text-foreground">KURIO</p>
          <p className="text-sm leading-[22px] text-foreground">
            Feito para colecionadores, criadores e cultura
          </p>
          <a
            href="mailto:contato@email.com"
            className="text-sm leading-[22px] text-foreground hover:text-accent"
          >
            contato@email.com
          </a>
          <p className="text-sm leading-[22px] text-foreground">+55 11 4002 8922</p>
        </div>

        <div className="rounded-b-xl bg-card p-5 sm:p-8">
          <div className="flex w-full flex-col gap-8 sm:flex-row">
            <FooterColumn title="Meu perfil">
              <li>
                <Link
                  to={isAuthenticated ? "/account/profile" : "/login"}
                  className="block hover:text-accent"
                >
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
                  <Link to="/" search={{ collection, page: 1 }} className="hover:text-accent">
                    {collection}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <div className="flex w-full flex-col gap-8 sm:w-[228px] sm:shrink-0">
              <div className="flex flex-col gap-5">
                <p className="text-lg font-bold leading-[16px] text-foreground">Redes sociais</p>
                <ul className="flex items-center gap-2.5">
                  {SOCIAL_LINKS.map(({ label, icon: Icon, className }) => (
                    <li key={label}>
                      <span
                        role="img"
                        aria-label={label}
                        className={`flex size-[30px] items-center justify-center border border-border-soft ${className}`}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-lg font-bold leading-[16px] text-foreground">
                  Carteiras compatíveis
                </p>
                <div className="flex h-[26px] items-center justify-center rounded-md border border-border-soft bg-secondary px-2">
                  <p className="whitespace-pre text-[9px] font-bold leading-none tracking-[0.1px] text-accent">
                    METAMASK &nbsp;•&nbsp; WALLETCONNECT &nbsp;•&nbsp; COINBASE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="pt-3 pb-5 text-center text-sm leading-[30px] text-foreground">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  );
}
