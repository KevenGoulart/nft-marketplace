import type { Quote } from "@/api/contracts/quote";
import { formatEth } from "@/lib/eth";

export function OrderReview({ quote }: { quote: Quote }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-[16px] text-foreground">
        <span className="font-bold">NFTs</span>
        <span className="font-medium">Subtotal</span>
      </div>
      <hr className="border-border" />

      <ul className="flex flex-col gap-3">
        {quote.items.map((item) => (
          <li
            key={item.itemId ?? item.nftId}
            className="flex items-center gap-3 bg-card px-2 py-2"
          >
            <img
              src={item.image}
              alt=""
              width={70}
              height={70}
              className="size-[70px] shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="truncate font-bold text-foreground">{item.title}</p>
              <p className="text-sm text-tertiary">{formatEth(item.unitPriceEth)} cada</p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-right">
              <span className="text-sm text-tertiary">(x {item.quantity})</span>
              <span className="font-bold text-accent">{formatEth(item.lineTotalEth)}</span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-3 text-[15px] text-foreground">
        <div className="flex items-start justify-between gap-2">
          <dt className="whitespace-nowrap">Subtotal</dt>
          <dd className="whitespace-nowrap text-lg">{formatEth(quote.subtotalEth)}</dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="shrink-0 whitespace-nowrap">
            {quote.appliedCoupon?.label ?? "Desconto do lançamento"}
          </dt>
          <dd className="shrink-0 whitespace-nowrap">(-) {formatEth(quote.discountEth)}</dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="whitespace-nowrap">Taxa de rede</dt>
          <dd className="flex flex-col items-end whitespace-nowrap">
            <span className="text-lg">{formatEth(quote.networkFeeEth)}</span>
            <span className="text-xs text-accent">Taxa estimada</span>
          </dd>
        </div>
      </dl>

      <hr className="border-border" />

      <div className="flex items-start justify-between gap-2 font-bold">
        <span className="whitespace-nowrap text-foreground">Total</span>
        <span className="whitespace-nowrap text-lg text-accent">{formatEth(quote.totalEth)}</span>
      </div>
    </div>
  );
}
