import { http, HttpResponse } from "msw";
import {
  changePasswordRequestSchema,
  updateProfileRequestSchema,
} from "@/api/contracts/profile";
import { changePassword, requireUser, updateProfile } from "@/mocks/db";
import { ValidationError } from "@/mocks/db/errors";
import { bearerToken, errorResponse } from "./respond";
import { toWireUser } from "./wire";

export const profileHandlers = [
  http.get("/api/profile", ({ request }) => {
    try {
      const user = requireUser(bearerToken(request));
      return HttpResponse.json(toWireUser(user));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.patch("/api/profile", async ({ request }) => {
    const parsed = updateProfileRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Dados de perfil inválidos",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const user = requireUser(bearerToken(request));
      const updated = updateProfile(user.id, parsed.data);
      return HttpResponse.json(toWireUser(updated));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.post("/api/profile/password", async ({ request }) => {
    const parsed = changePasswordRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Dados de senha inválidos",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const user = requireUser(bearerToken(request));
      await changePassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
