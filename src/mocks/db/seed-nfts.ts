import type { Network } from "@/api/contracts/common";
import type { NftRecord } from "./types";

const SEED_TIMESTAMP = "2026-08-01T12:00:00.000Z";

const IMAGE_VIOLET = "/mock-assets/nft/nft-1.webp";
const IMAGE_NEUTRAL = "/mock-assets/nft/nft-2.webp";
const IMAGE_EMERALD = "/mock-assets/nft/nft-3.webp";
const IMAGE_GOLDEN = "/mock-assets/nft/nft-4.webp";

const FIRST_NINE_IMAGES = [
  IMAGE_EMERALD,
  IMAGE_VIOLET,
  IMAGE_NEUTRAL,
  IMAGE_VIOLET,
  IMAGE_VIOLET,
  IMAGE_NEUTRAL,
  IMAGE_GOLDEN,
  IMAGE_GOLDEN,
  IMAGE_GOLDEN,
];

const IMAGE_BY_ADJECTIVE: Record<string, string> = {
  Violet: IMAGE_VIOLET,
  Cosmic: IMAGE_VIOLET,
  Silver: IMAGE_VIOLET,
  Azure: IMAGE_VIOLET,
  Ivory: IMAGE_NEUTRAL,
  Obsidian: IMAGE_NEUTRAL,
  Amber: IMAGE_NEUTRAL,
  Emerald: IMAGE_EMERALD,
  Sage: IMAGE_EMERALD,
  Crimson: IMAGE_EMERALD,
  Golden: IMAGE_GOLDEN,
  Neon: IMAGE_GOLDEN,
};

const COLLECTIONS = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];

const NETWORKS: Network[] = ["ethereum", "polygon", "solana"];

const ADJECTIVES = [
  "Emerald",
  "Sage",
  "Neon",
  "Cosmic",
  "Violet",
  "Ivory",
  "Golden",
  "Crimson",
  "Obsidian",
  "Azure",
  "Amber",
  "Silver",
];

const NOUNS = [
  "Ape",
  "Nomad",
  "Vessel",
  "Bloom",
  "Baron",
  "Signal",
  "Beat",
  "Drifter",
  "Oracle",
  "Voyager",
  "Relic",
  "Echo",
];

const BACKGROUNDS = ["Floresta", "Estúdio", "Nebulosa", "Deserto", "Oceano"];
const OUTFITS = ["Bomber Verde", "Moletom Lilás", "Terno Bege", "Jaqueta Couro"];
const ACCESSORIES = ["Óculos Redondo", "Chapéu Bucket", "Fone Retrô", "Nenhum"];

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

const TOTAL_NFTS = 32;

export function buildNftSeed(): NftRecord[] {
  const nfts: NftRecord[] = [];

  for (let i = 0; i < TOTAL_NFTS; i++) {
    const adjective = ADJECTIVES[i % ADJECTIVES.length];
    const noun = NOUNS[(i * 3) % NOUNS.length];
    const number = String(42 + i * 17).padStart(3, "0");
    const title = `${adjective} ${noun} #${number}`;
    const image = FIRST_NINE_IMAGES[i] ?? IMAGE_BY_ADJECTIVE[adjective];
    const collection = COLLECTIONS[i % COLLECTIONS.length];
    const network = NETWORKS[i % NETWORKS.length];

    const price = round2(0.02 + ((i * 0.83) % 12.28));
    const hadPriceDrop = i % 7 === 0 && i > 0;
    const previousPriceEth = hadPriceDrop ? String(round2(price * 1.22)) : null;

    const editionsTotal = [1, 5, 10, 20][i % 4];
    const editionsAvailable = editionsTotal;

    const rating = round2(3.6 + ((i * 0.37) % 1.4));
    const reviewCount = 4 + ((i * 13) % 57);

    nfts.push({
      id: `nft-${i + 1}`,
      slug: `nft-${i + 1}`,
      title,
      image,
      gallery: [image, image, image, image],
      collection,
      network,
      priceEth: String(price),
      previousPriceEth,
      editionsTotal,
      editionsAvailable,
      description:
        "Peça digital colecionável, verificada on-chain, parte de uma edição " +
        "curada com direitos de exibição para o colecionador.",
      creator: {
        name: `Estúdio ${adjective}`,
        avatarUrl: image,
      },
      attributes: [
        { trait: "Fundo", value: BACKGROUNDS[i % BACKGROUNDS.length] },
        { trait: "Traje", value: OUTFITS[i % OUTFITS.length] },
        { trait: "Acessório", value: ACCESSORIES[i % ACCESSORIES.length] },
      ],
      rating,
      reviewCount,
      version: 1,
      updatedAt: SEED_TIMESTAMP,
    });
  }

  return nfts;
}
