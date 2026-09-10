import { z } from "zod";
import { userSchema } from "./session";

export const updateProfileRequestSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo").optional(),
  email: z.email("E-mail inválido").optional(),
  avatarUrl: z.string().nullable().optional(),
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da atual",
    path: ["newPassword"],
  });
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

export const profileResponseSchema = userSchema;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
