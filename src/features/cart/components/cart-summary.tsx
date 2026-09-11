import { Link } from "@tanstack/react-router";
import type { Quote } from "@/api/contracts/quote";
import { formatEth } from "@/lib/eth";
import { CouponForm } from "./coupon-form";

export function CartSummary({ quote }: { quote: Quote }) {
  return (
    <aside aria-label="Resumo da carteira" className="flex w-full flex-col gap-6 md:w-[332px]">
      <div className="hidden flex-col gap-6 md:flex">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">Resumo da carteira</h2>
          <hr className="border-primary/60" />
        </div>

        <CouponForm appliedCoupon={quote.appliedCoupon} idPrefix="coupon-desktop" />

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
          <span className="whitespace-nowrap text-lg text-accent">
            {formatEth(quote.totalEth)}
          </span>
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
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 rounded-t-[24px] bg-card px-6 pt-4 pb-5 shadow-[0_0_10px_rgba(10,6,4,0.45)] md:hidden">
        <div className="absolute inset-x-0 -bottom-2 top-0 -z-10 bg-card" aria-hidden="true" />

        <CouponForm appliedCoupon={quote.appliedCoupon} idPrefix="coupon-mobile" />

        <dl className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm text-foreground">
          <div className="flex items-center justify-between gap-2">
            <dt>Subtotal</dt>
            <dd>{formatEth(quote.subtotalEth)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="truncate">
              {quote.appliedCoupon?.label ?? "Desconto do lançamento"}
            </dt>
            <dd className="shrink-0">(-) {formatEth(quote.discountEth)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt>Taxa de rede</dt>
            <dd>{formatEth(quote.networkFeeEth)}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between border-t border-border pt-3 font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-lg text-accent">{formatEth(quote.totalEth)}</span>
        </div>

        <Link
          to="/checkout"
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-base font-bold text-primary-foreground"
        >
          Conectar e finalizar
        </Link>
      </div>
    </aside>
  );
}
