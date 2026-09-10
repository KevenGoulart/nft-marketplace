import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart } from "@/api/contracts/cart";
import {
  addCartItem,
  applyCoupon,
  fetchCart,
  removeCartItem,
  removeCoupon,
  updateCartItem,
} from "./api";

export const cartQueryKey = ["cart"] as const;

export function useCartQuery() {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: ({ signal }) => fetchCart(signal),
  });
}

function useCartMutation<TVars>(mutationFn: (vars: TVars) => Promise<Cart>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}

export function useAddCartItemMutation() {
  return useCartMutation(({ nftId, quantity }: { nftId: string; quantity: number }) =>
    addCartItem(nftId, quantity)
  );
}

export function useUpdateCartItemMutation() {
  return useCartMutation(({ itemId, quantity }: { itemId: string; quantity: number }) =>
    updateCartItem(itemId, quantity)
  );
}

export function useRemoveCartItemMutation() {
  return useCartMutation((itemId: string) => removeCartItem(itemId));
}

export function useApplyCouponMutation() {
  return useCartMutation((code: string) => applyCoupon(code));
}

export function useRemoveCouponMutation() {
  return useCartMutation(() => removeCoupon());
}
