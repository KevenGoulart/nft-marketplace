import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().nullable(),
  username: z.string(),
  ensName: z.string(),
  walletNickname: z.string(),
  createdAt: z.iso.datetime(),
});
export type User = z.infer<typeof userSchema>;

export const signupRequestSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres"),
});
export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sessionResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
