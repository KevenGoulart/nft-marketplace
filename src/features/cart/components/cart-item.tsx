import type { QuoteLineItem } from "@/api/contracts/quote";
import { ApiRequestError } from "@/api/contracts/common";
import { useRemoveCartItemMutation, useUpdateCartItemMutation } from "../queries";
import { CartItemRow } from "./cart-item-row";

export function CartItem({ item }: { item: QuoteLineItem }) {
  const itemId = item.itemId as string;

  const update = useUpdateCartItemMutation();
  const remove = useRemoveCartItemMutation();

  const pending = update.isPending || remove.isPending;
  const error =
    update.error instanceof ApiRequestError
      ? update.error.body.error.message
      : update.isError
        ? "Não foi possível atualizar a quantidade. Tente novamente."
        : undefined;

  return (
    <CartItemRow
      item={item}
      disabled={pending}
      error={error}
      onQuantityChange={(quantity) => update.mutate({ itemId, quantity })}
      onRemove={() => remove.mutate(itemId)}
    />
  );
}
