import { SESSION_EXPIRED_EVENT } from "@/api/client";
import { queryClient } from "@/app/query-client";
import { router } from "@/app/router";
import { resyncRealtimeAuth } from "@/features/realtime/socket";
import { sessionQueryKey } from "./queries";

export function registerSessionExpiredHandler() {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    resyncRealtimeAuth();
    queryClient.setQueryData(sessionQueryKey, null);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "session",
    });
    const current = router.state.location;
    if (current.pathname === "/login") return;
    router.navigate({
      to: "/login",
      search: { redirect: current.href },
    });
  });
}
