import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, ShoppingCart, Star } from "lucide-react";
import type { NftDetail } from "@/api/contracts/nft";
import { formatEth } from "@/lib/eth";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";

export function MobileNftDetail({
  nft,
  soldOut,
  quantity,
  onQuantityChange,
  onBack,
  onToggleFavorite,
  favoritePending,
  onAddToCart,
  addToCartPending,
  addToCartSuccess,
}: {
  nft: NftDetail;
  soldOut: boolean;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onBack: () => void;
  onToggleFavorite: () => void;
  favoritePending: boolean;
  onAddToCart: () => void;
  addToCartPending: boolean;
  addToCartSuccess: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [drag, setDrag] = useState<{ startX: number; deltaX: number } | null>(null);
  const tokenNumber = nft.id.replace("nft-", "").padStart(4, "0");
  const canDrag = nft.gallery.length > 1;

  const SWIPE_THRESHOLD_PX = 40;

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!canDrag) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ startX: event.clientX, deltaX: 0 });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    setDrag({ ...drag, deltaX: event.clientX - drag.startX });
  }

  function endDrag() {
    if (!drag) return;
    if (drag.deltaX <= -SWIPE_THRESHOLD_PX && activeImage < nft.gallery.length - 1) {
      setActiveImage((index) => index + 1);
    } else if (drag.deltaX >= SWIPE_THRESHOLD_PX && activeImage > 0) {
      setActiveImage((index) => index - 1);
    }
    setDrag(null);
  }

  return (
    <div className="flex flex-col gap-0 md:hidden">
      <div
        className="-mx-4 -mt-6 flex flex-col gap-3 px-6 pt-6 pb-8"
        style={{
          backgroundImage:
            "linear-gradient(137.64deg, rgb(36, 22, 18) 11.999%, rgb(47, 29, 21) 106.59%)",
        }}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-secondary/80"
          >
            <ChevronLeft className="size-5 text-foreground" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            disabled={favoritePending}
            aria-pressed={nft.isFavorite}
            aria-label={nft.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              className="size-4 text-foreground"
              fill={nft.isFavorite ? "currentColor" : "none"}
              aria-hidden
            />
          </button>
        </div>

        <div
          className={cn(
            "relative h-[300px] w-full touch-pan-y overflow-hidden rounded-3xl",
            canDrag && "cursor-grab active:cursor-grabbing"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <img
            src={nft.gallery[activeImage]}
            alt={`Imagem de ${nft.title}`}
            className="size-full object-cover select-none"
            style={{
              transform: drag ? `translateX(${drag.deltaX}px)` : undefined,
              transition: drag ? "none" : "transform 200ms ease-out",
            }}
            draggable={false}
            fetchPriority="high"
          />
        </div>

        {nft.gallery.length > 1 ? (
          <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
            {nft.gallery.map((image, index) => (
              <button
                key={image + index}
                type="button"
                aria-label={`Ver imagem ${index + 1} de ${nft.title}`}
                onClick={() => setActiveImage(index)}
                className={cn(
                  "h-[7px] cursor-pointer rounded-full transition-all",
                  index === activeImage ? "w-4 bg-primary" : "w-[7px] bg-primary/40"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="-mx-4 -mt-6 flex flex-col gap-3 rounded-t-[24px] bg-card px-6 pt-8 pb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{nft.title}</h1>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-primary px-3 py-1.5 text-sm">
            <Star className="size-3.5 fill-accent text-accent" aria-hidden />
            <span className="font-medium text-foreground">{nft.rating.toFixed(1)}</span>
            <span className="text-secondary-foreground">({nft.reviewCount})</span>
          </span>
        </div>

        <p className="text-sm leading-6 text-secondary-foreground">{nft.description}</p>

        <div className="flex flex-col gap-2">
          <p className="text-[15px] font-bold text-foreground">Edição:</p>
          <div className="flex gap-3">
            <span className="rounded-full border border-border px-3 py-1.5 text-sm text-secondary-foreground">
              {nft.editionsAvailable}/{nft.editionsTotal}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                soldOut ? "border-destructive/40 text-destructive" : "border-primary text-accent"
              )}
            >
              {soldOut ? "ESGOTADA" : "ABERTA"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-[15px] text-tertiary">
          <p>ID do token: #{tokenNumber}</p>
          <p>Coleção: {nft.collection}</p>
          <p>Atributos: {nft.attributes.map((attribute) => attribute.value).join(", ")}</p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-4 rounded-t-[24px] bg-card px-6 pt-4 pb-5 shadow-[0_0_10px_rgba(10,6,4,0.45)]">
        <div className="absolute inset-x-0 -bottom-2 top-0 -z-10 bg-card" aria-hidden="true" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-medium text-secondary-foreground">Qtd.</span>
            {soldOut ? (
              <span className="text-sm text-muted-foreground">Esgotado</span>
            ) : (
              <QuantityStepper
                value={quantity}
                max={nft.editionsAvailable}
                onChange={onQuantityChange}
                size="sm"
              />
            )}
          </div>
          <span className="text-lg font-bold text-accent">{formatEth(nft.priceEth)}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={soldOut || addToCartPending}
            onClick={onAddToCart}
            className="flex h-[52px] flex-1 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-base font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addToCartSuccess ? "Adicionado ✓" : soldOut ? "Esgotado" : "Comprar NFT"}
          </button>
          <Link
            to="/cart"
            aria-label="Ver carrinho"
            className="flex size-[52px] shrink-0 items-center justify-center rounded-full border border-border bg-secondary"
          >
            <ShoppingCart className="size-5 text-foreground" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
