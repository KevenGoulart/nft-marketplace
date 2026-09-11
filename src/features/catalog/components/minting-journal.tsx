const POSTS = [
  {
    image: "/mock-assets/nft/nft-1.webp",
    date: "12 de setembro",
    readingTime: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    excerpt: "Aprenda a colecionar, negociar e verificar ativos digitais.",
  },
  {
    image: "/mock-assets/nft/nft-2.webp",
    date: "13 de setembro",
    readingTime: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    excerpt: "Conheça criadores que moldam a cultura digital.",
  },
  {
    image: "/mock-assets/nft/nft-3.webp",
    date: "15 de setembro",
    readingTime: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    excerpt: "Entenda raridade, procedência, direitos autorais e utilidade.",
  },
  {
    image: "/mock-assets/nft/nft-4.webp",
    date: "15 de setembro",
    readingTime: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    excerpt: "Proteja sua carteira, seus ativos e sua identidade.",
  },
];

export function MintingJournalSection() {
  return (
    <section
      aria-labelledby="minting-journal-heading"
      className="mt-14 mb-24 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 text-center">
        <h2 id="minting-journal-heading" className="text-2xl font-bold text-foreground">
          Diário da Cunhagem
        </h2>
        <p className="text-sm text-secondary-foreground">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade
          digital.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-disabled="true">
        {POSTS.map((post) => (
          <div key={post.title} className="flex flex-col overflow-hidden rounded-lg bg-card">
            <img
              src={post.image}
              alt=""
              className="aspect-[268/195] w-full object-cover"
            />
            <div className="flex flex-col items-start gap-2 px-4 pt-3 pb-4">
              <p className="text-xs text-secondary-foreground">
                {post.date} · {post.readingTime}
              </p>
              <p className="text-base font-bold text-foreground">{post.title}</p>
              <p className="text-xs text-secondary-foreground">{post.excerpt}</p>
              <span className="text-xs font-bold text-accent">Ler mais →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
