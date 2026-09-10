import { apiClient } from "@/api/client";
import type {
  LoginRequest,
  SessionResponse,
  SignupRequest,
  User,
} from "@/api/contracts/session";

export async function signupRequest(input: SignupRequest) {
  const { data } = await apiClient.post<SessionResponse>("/auth/signup", input);
  return data;
}

export async function loginRequest(input: LoginRequest) {
  const { data } = await apiClient.post<SessionResponse>("/auth/login", input);
  return data;
}

export async function fetchSession() {
  const { data } = await apiClient.get<{ user: User }>("/auth/session");
  return data.user;
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}
