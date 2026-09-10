import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionQueryKey } from "@/features/auth";
import { changePassword, updateProfile } from "./api";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryKey, user);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
  });
}
