import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NftDetail, NftSummary } from "@/api/contracts/nft";
import type { Paginated } from "@/api/contracts/common";
import type { NftUpdatedEvent, OrderUpdatedEvent } from "@/api/contracts/realtime";
import type { Cart } from "@/api/contracts/cart";
import { cartQueryKey } from "@/features/cart/queries";
import { orderQueryKey } from "@/features/checkout/queries";
import { getRealtimeSocket, onRealtimeReconnect } from "./socket";
import { pushRealtimeNotice } from "./notices";

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    function handleNftUpdated(event: NftUpdatedEvent) {
      queryClient.setQueryData<NftDetail>(["nft", event.nftId], (current) => {
        if (!current || event.version <= current.version) return current;
        return {
          ...current,
          priceEth: event.priceEth,
          previousPriceEth: event.previousPriceEth,
          editionsAvailable: event.editionsAvailable,
          editionAvailable: event.editionsAvailable > 0,
          version: event.version,
          updatedAt: event.updatedAt,
        };
      });

      queryClient.setQueriesData<Paginated<NftSummary>>(
        { queryKey: ["nfts"] },
        (current) => {
          if (!current) return current;
          let changed = false;
          const items = current.items.map((item) => {
            if (item.id !== event.nftId || event.version <= item.version) return item;
            changed = true;
            return {
              ...item,
              priceEth: event.priceEth,
              previousPriceEth: event.previousPriceEth,
              editionsAvailable: event.editionsAvailable,
              version: event.version,
              updatedAt: event.updatedAt,
            };
          });
          return changed ? { ...current, items } : current;
        }
      );

      const cart = queryClient.getQueryData<Cart>(cartQueryKey);
      const affectsCurrentCart = cart?.quote.items.some((item) => item.nftId === event.nftId) ?? false;
      if (affectsCurrentCart) {
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
        pushRealtimeNotice(
          queryClient,
          "O preço ou a disponibilidade de um item no seu carrinho mudou. Revise antes de continuar."
        );
      }
    }

    function handleOrderUpdated(event: OrderUpdatedEvent) {
      const key = orderQueryKey(event.orderId);
      const cached = queryClient.getQueryData<{ version: number }>(key);
      if (cached && event.version <= cached.version) return;
      queryClient.invalidateQueries({ queryKey: key });
    }

    getRealtimeSocket().then((socket) => {
      if (cancelled) return;
      socket.on("nft.updated", handleNftUpdated);
      socket.on("order.updated", handleOrderUpdated);
    });

    const unsubscribeReconnect = onRealtimeReconnect(() => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    });

    return () => {
      cancelled = true;
      getRealtimeSocket().then((socket) => {
        socket.off("nft.updated", handleNftUpdated);
        socket.off("order.updated", handleOrderUpdated);
      });
      unsubscribeReconnect();
    };
  }, [queryClient]);
}
