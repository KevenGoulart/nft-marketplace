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

/**
 * "Diário da Cunhagem" no Figma é um blog editorial (data + tempo de leitura por post).
 * Fora do escopo do desafio (seção 1: "páginas editoriais... não fazem parte da
 * entrega") — mesmo critério já aplicado ao item "Aprenda" do menu. Mantido visível
 * para fidelidade ao design, mas sem nenhum elemento interativo/navegável: nada aqui é
 * `<a>`/`<button>` ou tem `onClick`, só `<div>`/`<span>`, para não aparentar uma
 * funcionalidade que não existe (proibido pelo enunciado).
 */
export function MintingJournalSection() {
  return (
    <section aria-labelledby="minting-journal-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-border pb-6 text-center">
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
          <div key={post.title} className="flex flex-col gap-3">
            <img
              src={post.image}
              alt=""
              className="aspect-[258/200] w-full rounded-xl object-cover"
            />
            <p className="text-xs text-tertiary">
              {post.date} · {post.readingTime}
            </p>
            <p className="font-bold text-foreground">{post.title}</p>
            <p className="text-sm text-secondary-foreground">{post.excerpt}</p>
            <span className="text-sm text-muted-foreground">Ler mais</span>
          </div>
        ))}
      </div>
    </section>
  );
}
