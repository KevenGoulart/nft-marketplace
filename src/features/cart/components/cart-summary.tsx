import { Link } from "@tanstack/react-router";
import type { Quote } from "@/api/contracts/quote";
import { formatEth } from "@/lib/eth";
import { CouponForm } from "./coupon-form";

export function CartSummary({ quote }: { quote: Quote }) {
  return (
    <aside
      aria-label="Resumo da carteira"
      className="flex w-full flex-col gap-6 rounded-2xl bg-card p-6 md:w-[332px] md:rounded-none md:bg-transparent md:p-0"
    >
      <div className="hidden flex-col gap-3 md:flex">
        <h2 className="text-lg font-bold text-foreground">Resumo da carteira</h2>
        <hr className="border-primary/60" />
      </div>

      <CouponForm appliedCoupon={quote.appliedCoupon} />

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

      <div className="flex items-start justify-between gap-2 font-bold">
        <span className="whitespace-nowrap text-foreground">Total</span>
        <span className="whitespace-nowrap text-lg text-accent">{formatEth(quote.totalEth)}</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Link
          to="/checkout"
          className="flex h-10 w-full items-center justify-center rounded-[3px] bg-primary text-[15px] font-bold text-primary-foreground"
        >
          Conectar e finalizar
        </Link>
        <Link to="/" className="text-[15px] text-accent hover:underline">
          Continuar explorando
        </Link>
      </div>
    </aside>
  );
}
