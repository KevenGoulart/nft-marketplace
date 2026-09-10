import axios, { isAxiosError } from "axios";
import { z } from "zod";
import { ApiRequestError, apiErrorSchema } from "./contracts/common";

const AUTH_TOKEN_STORAGE_KEY = "kurio.auth.token";

let authToken: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    : null;

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export const SESSION_EXPIRED_EVENT = "kurio:session-expired";

const GUEST_CART_STORAGE_KEY = "kurio.cart.guest-id";
const GUEST_CART_HEADER = "X-Guest-Cart-Id";

let guestCartId: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(GUEST_CART_STORAGE_KEY)
    : null;

export function getGuestCartId() {
  return guestCartId;
}

export function setGuestCartId(id: string) {
  guestCartId = id;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, id);
}

export function clearGuestCartId() {
  guestCartId = null;
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.set("Authorization", `Bearer ${authToken}`);
  } else if (guestCartId && config.url?.startsWith("/cart")) {
    config.headers.set(GUEST_CART_HEADER, guestCartId);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const parsed = apiErrorSchema.safeParse(error.response.data);
      const body: z.infer<typeof apiErrorSchema> = parsed.success
        ? parsed.data
        : {
            error: {
              code: "TRANSIENT_FAILURE",
              message: error.message || "Falha inesperada na API",
            },
          };

      if (error.response.status === 401) {
        const hadToken = authToken !== null;
        setAuthToken(null);
        if (hadToken && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        }
      }

      return Promise.reject(new ApiRequestError(error.response.status, body));
    }

    return Promise.reject(
      new ApiRequestError(0, {
        error: {
          code: "TRANSIENT_FAILURE",
          message: "Sem conexão com a API",
        },
      })
    );
  }
);
