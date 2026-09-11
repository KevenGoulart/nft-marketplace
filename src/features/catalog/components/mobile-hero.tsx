import { ChevronRight } from "lucide-react";

export function MobileHero() {
  return (
    <section
      aria-label="Destaque"
      className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl p-4"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(210,138,76,0.2), rgba(210,138,76,0.1)), radial-gradient(circle at 10% 45%, rgba(221,154,95,0.35), transparent 60%), radial-gradient(circle at 58% 65%, rgba(221,154,95,0.3), transparent 60%)",
      }}
    >
      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-xs font-medium text-foreground">Bem-vindo à Kurio</p>
          <h1 className="text-base font-bold leading-[22px] text-foreground">
            SEJA DONO DA
            <br />
            CULTURA DIGITAL
          </h1>
          <p className="text-xs leading-[18px] text-secondary-foreground">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <a
            href="#catalog-grid"
            className="mt-1 flex items-center gap-2 text-xs font-bold text-accent"
          >
            EXPLORAR
            <ChevronRight className="size-3.5" aria-hidden />
          </a>
        </div>

        <div className="relative size-[128px] shrink-0">
          <img
            src="/mock-assets/hero/hero-main.webp"
            alt="Personagem colecionável em destaque no catálogo Kurio"
            className="size-[128px] rounded-2xl object-cover"
            width={128}
            height={128}
          />
          <img
            src="/mock-assets/hero/hero-avatar.webp"
            alt=""
            className="absolute -bottom-2 -left-3 size-[52px] rounded-2xl object-cover"
            width={52}
            height={52}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-[7px] w-4 rounded-full bg-primary" />
        <span className="size-[7px] rounded-full bg-primary/40" />
        <span className="size-[7px] rounded-full bg-primary/40" />
      </div>
    </section>
  );
}
