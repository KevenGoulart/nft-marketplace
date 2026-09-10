import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

export const realtimeNoticesKey = ["realtime", "notices"] as const;

export type RealtimeNotice = { id: string; message: string };

export function pushRealtimeNotice(queryClient: QueryClient, message: string) {
  const notice: RealtimeNotice = { id: crypto.randomUUID(), message };
  queryClient.setQueryData<RealtimeNotice[]>(realtimeNoticesKey, (current = []) => [
    ...current,
    notice,
  ]);
}

export function useRealtimeNotices() {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<RealtimeNotice[]>({
    queryKey: realtimeNoticesKey,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  function dismiss(id: string) {
    queryClient.setQueryData<RealtimeNotice[]>(realtimeNoticesKey, (current = []) =>
      current.filter((notice) => notice.id !== id)
    );
  }

  return { notices: data, dismiss };
}
