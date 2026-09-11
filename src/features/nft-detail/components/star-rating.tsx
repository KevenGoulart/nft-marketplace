import { Star } from "lucide-react";

export function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const safeRating = rating ?? 0;
  const safeReviewCount = reviewCount ?? 0;
  const filled = Math.round(safeRating);

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${safeRating.toFixed(1)} de 5 estrelas, ${safeReviewCount} avaliações de colecionadores`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className="size-[15px] text-accent"
          fill={index < filled ? "currentColor" : "none"}
          aria-hidden
        />
      ))}
      <p className="whitespace-nowrap text-[15px] text-foreground">
        {safeReviewCount} avaliações de colecionadores
      </p>
    </div>
  );
}
