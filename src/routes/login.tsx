import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMediaQuery } from "@/lib/use-media-query";
import { AuthModalShell } from "@/features/auth/components/auth-modal-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { MobileAuthScreen } from "@/features/auth/components/mobile-auth-screen";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const onSuccess = () => navigate({ to: redirect || "/" });

  if (!isDesktop) {
    return <MobileAuthScreen tab="login" onSuccess={onSuccess} />;
  }

  return (
    <AuthModalShell
      activeTab="login"
      subtitle="Entre para gerenciar sua carteira, coleção e perfil de criador."
      onClose={() => navigate({ to: "/" })}
      onTabChange={(tab) => navigate({ to: tab === "login" ? "/login" : "/signup" })}
    >
      <LoginForm onSuccess={onSuccess} renderHeading />
    </AuthModalShell>
  );
}
