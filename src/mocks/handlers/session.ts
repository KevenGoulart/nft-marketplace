import { http, HttpResponse } from "msw";
import { loginRequestSchema, signupRequestSchema } from "@/api/contracts/session";
import { ValidationError } from "@/mocks/db/errors";
import {
  createSessionToken,
  createUser,
  requireUser,
  revokeToken,
  verifyCredentials,
} from "@/mocks/db";
import { bearerToken, errorResponse } from "./respond";
import { toWireUser } from "./wire";

export const sessionHandlers = [
  http.post("/api/auth/signup", async ({ request }) => {
    const parsed = signupRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError("Dados de cadastro inválidos", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      );
    }
    try {
      const user = await createUser(parsed.data);
      const token = createSessionToken(user.id);
      return HttpResponse.json({ user: toWireUser(user), token }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const parsed = loginRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError("Dados de login inválidos", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      );
    }
    try {
      const user = await verifyCredentials(parsed.data.email, parsed.data.password);
      const token = createSessionToken(user.id);
      return HttpResponse.json({ user: toWireUser(user), token });
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.get("/api/auth/session", ({ request }) => {
    try {
      const user = requireUser(bearerToken(request));
      return HttpResponse.json({ user: toWireUser(user) });
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.post("/api/auth/logout", ({ request }) => {
    const token = bearerToken(request);
    if (token) revokeToken(token);
    return new HttpResponse(null, { status: 204 });
  }),
];
