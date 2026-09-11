export function CatalogHero() {
  return (
    <section
      aria-label="Destaque"
      className="relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10"
    >
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl flex-col items-start gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium tracking-[1.4px] text-foreground">
              Bem-vindo à Kurio
            </p>
            <h1 className="font-bold text-3xl leading-tight text-foreground sm:text-4xl lg:text-[43px] lg:leading-[1.15]">
              SEJA DONO DO FUTURO DA ARTE DIGITAL
            </h1>
            <p className="text-sm leading-6 text-secondary-foreground">
              Descubra NFTs selecionados de criadores emergentes e consagrados.
              Colecione arte digital rara, apoie artistas e tenha uma parte da
              cultura da internet.
            </p>
          </div>
          <a
            href="#catalog-grid"
            className="flex h-10 w-[140px] items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground"
          >
            EXPLORAR
          </a>

          <div className="flex items-center gap-2 self-start lg:self-end" aria-hidden="true">
            <span className="size-2 rounded-full bg-primary/40" />
            <span className="size-2 rounded-full bg-primary/40" />
            <span className="size-2 rounded-full bg-primary" />
          </div>
        </div>

        <div className="relative size-[280px] shrink-0 overflow-hidden rounded-3xl sm:size-[360px] lg:size-[450px]">
          <img
            src="/mock-assets/hero/hero-main.webp"
            alt="Personagem colecionável em destaque no catálogo Kurio"
            className="size-full object-cover"
            fetchPriority="high"
            width={450}
            height={450}
          />
        </div>
      </div>
    </section>
  );
}
