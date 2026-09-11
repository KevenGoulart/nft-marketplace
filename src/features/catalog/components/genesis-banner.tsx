const PANELS = [
  {
    image: "/mock-assets/nft/nft-1.webp",
    title: ["Lançamentos gênesis", "de edição limitada"],
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
  },
  {
    image: "/mock-assets/nft/nft-2.webp",
    title: ["Arte digital selecionada", "e muito mais"],
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
  },
];

export function GenesisBanner() {
  return (
    <section
      aria-label="Destaques da Kurio"
      className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7"
    >
      {PANELS.map((panel) => (
        <div
          key={panel.title[0]}
          className="relative flex h-[210px] items-center gap-2 overflow-hidden rounded-lg bg-card sm:h-[250px]"
        >
          <div className="pointer-events-none absolute -left-10 top-1/2 size-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <img
            src={panel.image}
            alt=""
            className="h-full w-[40%] shrink-0 rounded-[18px] object-cover sm:w-[49%]"
          />
          <div className="relative flex flex-1 flex-col items-end gap-2 py-6 pr-4 text-right sm:gap-3 sm:py-9 sm:pr-6">
            <p className="text-sm leading-5 font-bold text-foreground sm:text-lg sm:leading-6">
              {panel.title[0]}
              <br />
              {panel.title[1]}
            </p>
            <p className="text-xs leading-5 text-secondary-foreground sm:text-sm sm:leading-6">
              {panel.description}
            </p>
            <a
              href="#catalog-grid"
              className="flex h-9 w-[120px] items-center justify-center gap-2 rounded-md bg-primary text-xs font-medium text-primary-foreground sm:h-10 sm:w-[140px] sm:text-sm"
            >
              Explorar <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      ))}
    </section>
  );
}
