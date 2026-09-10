import type { Quote, QuoteLineItemInput } from "@/api/contracts/quote";
import { db } from "./store";
import { getNftRecord } from "./nfts";
import { multiplyByInt, percentOf, subtractEth, sumEth } from "./decimal";
import {
  AvailabilityConflictError,
  CouponExpiredError,
  CouponInvalidError,
  NotFoundError,
} from "./errors";
import { nowIso } from "./crypto";
import type { NftRecord } from "./types";

export const NETWORK_FEE_ETH = "0.0025";

export function assertAvailable(nft: NftRecord, requestedQuantity: number) {
  if (requestedQuantity > nft.editionsAvailable) {
    throw new AvailabilityConflictError(
      `Apenas ${nft.editionsAvailable} edição(ões) disponível(is) para "${nft.title}"`
    );
  }
}

function resolveCoupon(code: string | undefined) {
  if (!code) return null;
  const coupon = db.coupons.get(code.trim().toUpperCase());
  if (!coupon || !coupon.active) {
    throw new CouponInvalidError("Cupom inválido");
  }
  if (coupon.expiresAt && coupon.expiresAt < nowIso()) {
    throw new CouponExpiredError("Cupom expirado");
  }
  return coupon;
}

export function computeQuote(
  lineInputs: QuoteLineItemInput[],
  couponCode: string | undefined
): Quote {
  if (lineInputs.length === 0) {
    return {
      version: 0,
      items: [],
      appliedCoupon: null,
      subtotalEth: "0",
      discountEth: "0",
      networkFeeEth: "0",
      totalEth: "0",
      generatedAt: nowIso(),
    };
  }

  const resolved = lineInputs.map((input) => {
    const record = db.nfts.get(input.nftId);
    if (!record) throw new NotFoundError(`NFT ${input.nftId} não encontrado`);
    return { input, record };
  });

  const items = resolved.map(({ input, record }) => ({
    itemId: input.itemId,
    nftId: record.id,
    title: record.title,
    image: record.image,
    unitPriceEth: record.priceEth,
    quantity: input.quantity,
    editionsAvailable: record.editionsAvailable,
    lineTotalEth: multiplyByInt(record.priceEth, input.quantity),
  }));

  const subtotalEth = sumEth(items.map((item) => item.lineTotalEth));
  const coupon = resolveCoupon(couponCode);
  const discountEth = coupon ? percentOf(subtotalEth, coupon.discountPercent) : "0";
  const networkFeeEth = NETWORK_FEE_ETH;
  const totalEth = sumEth([subtractEth(subtotalEth, discountEth), networkFeeEth]);

  const version = resolved.reduce(
    (acc, { record }) => acc + record.version * 1000 + record.editionsAvailable,
    coupon ? 7 : 0
  );

  return {
    version,
    items,
    appliedCoupon: coupon
      ? { code: coupon.code, label: coupon.label, discountEth }
      : null,
    subtotalEth,
    discountEth,
    networkFeeEth,
    totalEth,
    generatedAt: nowIso(),
  };
}

export function assertAllAvailable(lineInputs: QuoteLineItemInput[]) {
  for (const input of lineInputs) {
    const record = getNftRecord(input.nftId);
    assertAvailable(record, input.quantity);
  }
}
