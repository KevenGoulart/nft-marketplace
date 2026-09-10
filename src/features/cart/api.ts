import { apiClient, clearGuestCartId, getAuthToken, setGuestCartId } from "@/api/client";
import type { Cart } from "@/api/contracts/cart";

function rememberGuestCart(cart: Cart) {
  if (!getAuthToken()) setGuestCartId(cart.id);
  return cart;
}

export async function fetchCart(signal?: AbortSignal) {
  const { data } = await apiClient.get<Cart>("/cart", { signal });
  return rememberGuestCart(data);
}

export async function addCartItem(nftId: string, quantity: number) {
  const { data } = await apiClient.post<Cart>("/cart/items", { nftId, quantity });
  return rememberGuestCart(data);
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await apiClient.patch<Cart>(`/cart/items/${itemId}`, { quantity });
  return rememberGuestCart(data);
}

export async function removeCartItem(itemId: string) {
  const { data } = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
  return rememberGuestCart(data);
}

export async function applyCoupon(code: string) {
  const { data } = await apiClient.post<Cart>("/cart/coupon", { code });
  return rememberGuestCart(data);
}

export async function removeCoupon() {
  const { data } = await apiClient.delete<Cart>("/cart/coupon");
  return rememberGuestCart(data);
}

export async function mergeGuestCart(guestCartId: string) {
  const { data } = await apiClient.post<Cart>("/cart/merge", { guestCartId });
  clearGuestCartId();
  return data;
}
