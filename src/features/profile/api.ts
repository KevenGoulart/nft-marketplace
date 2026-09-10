import { apiClient } from "@/api/client";
import type { ChangePasswordRequest, UpdateProfileRequest } from "@/api/contracts/profile";
import type { User } from "@/api/contracts/session";

export async function updateProfile(input: UpdateProfileRequest) {
  const { data } = await apiClient.patch<User>("/profile", input);
  return data;
}

export async function changePassword(input: ChangePasswordRequest) {
  await apiClient.post("/profile/password", input);
}
