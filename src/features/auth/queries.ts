import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginRequest, SignupRequest, User } from "@/api/contracts/session";
import { getGuestCartId, setAuthToken } from "@/api/client";
import { mergeGuestCart } from "@/features/cart/api";
import { clearPendingCheckout, clearPendingCheckoutIfOtherUser } from "@/features/checkout/pending-order";
import { resyncRealtimeAuth } from "@/features/realtime/socket";
import { fetchSession, loginRequest, logoutRequest, signupRequest } from "./api";

export const sessionQueryKey = ["session"] as const;

export const sessionQueryOptions = queryOptions({
  queryKey: sessionQueryKey,
  queryFn: fetchSession,
  staleTime: Infinity,
  retry: false,
});

export function useSession() {
  const query = useQuery(sessionQueryOptions);
  return {
    user: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    isLoading: query.isLoading,
  };
}

async function adoptSession(
  queryClient: ReturnType<typeof useQueryClient>,
  user: User,
  token: string
) {
  const guestCartId = getGuestCartId();
  setAuthToken(token);
  resyncRealtimeAuth();
  clearPendingCheckoutIfOtherUser(user.id);
  if (guestCartId) {
    await mergeGuestCart(guestCartId).catch(() => {
    });
  }
  queryClient.setQueryData(sessionQueryKey, user);
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== "session",
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequest) => loginRequest(input),
    onSuccess: ({ user, token }) => adoptSession(queryClient, user, token),
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupRequest) => signupRequest(input),
    onSuccess: ({ user, token }) => adoptSession(queryClient, user, token),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await logoutRequest();
    },
    onSettled: () => {
      setAuthToken(null);
      resyncRealtimeAuth();
      clearPendingCheckout();
      queryClient.setQueryData(sessionQueryKey, null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
    },
  });
}
