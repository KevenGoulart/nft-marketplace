const PLACEHOLDER_IMAGES = [
  "/mock-assets/nft/nft-1.webp",
  "/mock-assets/nft/nft-2.webp",
  "/mock-assets/nft/nft-3.webp",
  "/mock-assets/nft/nft-4.webp",
  "/mock-assets/nft/nft-3.webp",
  "/mock-assets/nft/nft-1.webp",
  "/mock-assets/nft/nft-4.webp",
  "/mock-assets/nft/nft-2.webp",
];

export function AuthBackdrop() {
  return (
    <div
      inert
      className="pointer-events-none fixed inset-0 select-none overflow-hidden opacity-50 blur-[2px]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl flex-col items-start gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium tracking-[1.4px] text-foreground">
                  Bem-vindo à Kurio
                </span>
                <span className="font-bold text-3xl leading-tight text-foreground sm:text-4xl lg:text-[43px] lg:leading-[1.15]">
                  SEJA DONO DO FUTURO DA ARTE DIGITAL
                </span>
                <span className="text-sm leading-6 text-secondary-foreground">
                  Descubra NFTs selecionados de criadores emergentes e consagrados.
                  Colecione arte digital rara, apoie artistas e tenha uma parte da
                  cultura da internet.
                </span>
              </div>
              <span className="flex h-10 w-[140px] items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
                EXPLORAR
              </span>
            </div>

            <div className="relative size-[280px] shrink-0 overflow-hidden rounded-3xl sm:size-[360px] lg:size-[450px]">
              <img
                src="/mock-assets/hero/hero-main.webp"
                alt=""
                className="size-full object-cover"
                width={450}
                height={450}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-8 gap-y-9 lg:grid-cols-4">
          {PLACEHOLDER_IMAGES.map((src, index) => (
            <div key={index} className="aspect-[258/300] w-full overflow-hidden rounded-xl bg-card">
              <img src={src} alt="" className="size-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
