import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { QuoteLineItem } from "@/api/contracts/quote";
import { formatEth } from "@/lib/eth";
import { QuantityStepper } from "@/features/nft-detail/components/quantity-stepper";

function editionsLabel(editionsAvailable: number) {
  if (editionsAvailable <= 0) return "Esgotado";
  if (editionsAvailable === 1) return "Última edição disponível";
  return `${editionsAvailable} edições disponíveis`;
}

export function CartItemRow({
  item,
  disabled,
  error,
  onQuantityChange,
  onRemove,
}: {
  item: QuoteLineItem;
  disabled: boolean;
  error?: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const maxQuantity = Math.max(item.quantity, item.editionsAvailable);

  return (
    <li className="flex flex-col gap-2">
      <div className="hidden w-full items-center justify-between gap-4 rounded-md bg-card px-4 py-3 md:flex">
        <Link
          to="/nft/$nftId"
          params={{ nftId: item.nftId }}
          className="flex w-[250px] items-center gap-4 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <img
            src={item.image}
            alt=""
            width={70}
            height={70}
            className="size-[70px] shrink-0 rounded-md object-cover"
          />
          <span className="flex flex-col gap-1.5">
            <span className="font-bold text-foreground">{item.title}</span>
            <span className="text-sm text-tertiary">{editionsLabel(item.editionsAvailable)}</span>
          </span>
        </Link>
        <span className="w-[77px] text-center font-bold text-tertiary">
          {formatEth(item.unitPriceEth)}
        </span>
        <div className="flex w-[75px] shrink-0 justify-center">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={maxQuantity}
            disabled={disabled}
            onChange={onQuantityChange}
          />
        </div>
        <span className="w-[87px] text-right font-bold text-accent">
          {formatEth(item.lineTotalEth)}
        </span>
        <button
          type="button"
          aria-label={`Remover ${item.title} do carrinho`}
          disabled={disabled}
          onClick={onRemove}
          className="text-foreground/80 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
        >
          <Trash2 className="size-6" aria-hidden />
        </button>
      </div>

      <div className="relative flex w-full gap-3 rounded-2xl bg-card p-0 shadow-[0px_6px_20px_0px_rgba(10,6,4,0.45)] md:hidden">
        <Link
          to="/nft/$nftId"
          params={{ nftId: item.nftId }}
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <img
            src={item.image}
            alt=""
            width={100}
            height={100}
            className="size-[100px] rounded-l-2xl object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pr-3">
          <Link
            to="/nft/$nftId"
            params={{ nftId: item.nftId }}
            className="truncate text-[15px] font-bold text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {item.title}
          </Link>
          <p className="text-sm text-tertiary">
            {editionsLabel(item.editionsAvailable)}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-accent">{formatEth(item.unitPriceEth)}</span>
            <QuantityStepper
              size="sm"
              value={item.quantity}
              max={maxQuantity}
              disabled={disabled}
              onChange={onQuantityChange}
            />
          </div>
        </div>
        <button
          type="button"
          aria-label={`Remover ${item.title} do carrinho`}
          disabled={disabled}
          onClick={onRemove}
          className="absolute right-3 top-3 text-foreground/80 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
        >
          <Trash2 className="size-5" aria-hidden />
        </button>
      </div>

      {error ? (
        <p role="alert" className="px-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}
