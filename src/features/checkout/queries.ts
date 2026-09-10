import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderRequest, Order } from "@/api/contracts/orders";
import { ApiRequestError } from "@/api/contracts/common";
import { useSession } from "@/features/auth";
import { cartQueryKey } from "@/features/cart/queries";
import { createOrder, fetchOrder } from "./api";
import { clearPendingCheckout, ensureIdempotencyKey, setPendingOrderId } from "./pending-order";

export function orderQueryKey(orderId: string) {
  return ["order", orderId] as const;
}

export function useOrderQuery(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderQueryKey(orderId),
    queryFn: ({ signal }) => fetchOrder(orderId, signal),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 5000 : false),
    enabled: options?.enabled,
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => {
      const idempotencyKey = ensureIdempotencyKey(user!.id);
      return createOrder(idempotencyKey, payload);
    },
    onSuccess: (order: Order) => {
      setPendingOrderId(user!.id, order.id);
      queryClient.setQueryData(orderQueryKey(order.id), order);
    },
  });
}

export function isQuoteOutdated(error: unknown) {
  return error instanceof ApiRequestError && error.body.error.code === "QUOTE_OUTDATED";
}

export function isAvailabilityConflict(error: unknown) {
  return error instanceof ApiRequestError && error.body.error.code === "AVAILABILITY_CONFLICT";
}

export function useSettlePendingCheckout() {
  const queryClient = useQueryClient();
  return (order: Order) => {
    if (order.status === "pending") return;
    clearPendingCheckout();
    if (order.status === "confirmed") {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    }
  };
}
