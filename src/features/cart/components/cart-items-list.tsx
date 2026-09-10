import type { QuoteLineItem } from "@/api/contracts/quote";
import { CartItem } from "./cart-item";

export function CartItemsList({ items }: { items: QuoteLineItem[] }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="hidden w-full items-center justify-between px-4 md:flex">
        <span className="w-[250px] font-bold text-foreground">NFTs</span>
        <span className="w-[77px] text-center font-medium text-foreground">Preço</span>
        <span className="w-[75px] text-center font-bold text-foreground">Edições</span>
        <span className="w-[87px] text-right font-medium text-foreground">Total</span>
        <span className="w-6" aria-hidden />
      </div>
      <hr className="hidden border-border md:block" />
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <CartItem key={item.itemId ?? item.nftId} item={item} />
        ))}
      </ul>
    </div>
  );
}
