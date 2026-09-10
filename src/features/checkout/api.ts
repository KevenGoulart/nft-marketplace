import { apiClient } from "@/api/client";
import type { CreateOrderRequest, Order } from "@/api/contracts/orders";

export async function createOrder(idempotencyKey: string, payload: CreateOrderRequest) {
  const { data } = await apiClient.post<Order>("/orders", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data;
}

export async function fetchOrder(orderId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<Order>(`/orders/${orderId}`, { signal });
  return data;
}
