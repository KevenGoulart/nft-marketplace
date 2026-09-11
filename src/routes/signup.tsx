import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMediaQuery } from "@/lib/use-media-query";
import { AuthModalShell } from "@/features/auth/components/auth-modal-shell";
import { SignupForm } from "@/features/auth/components/signup-form";
import { MobileAuthScreen } from "@/features/auth/components/mobile-auth-screen";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const onSuccess = () => navigate({ to: "/" });

  if (!isDesktop) {
    return <MobileAuthScreen tab="signup" onSuccess={onSuccess} />;
  }

  return (
    <AuthModalShell
      activeTab="signup"
      subtitle="Cadastre-se para favoritar, comprar e acompanhar seus pedidos na Kurio."
      onClose={() => navigate({ to: "/" })}
      onTabChange={(tab) => navigate({ to: tab === "login" ? "/login" : "/signup" })}
    >
      <SignupForm onSuccess={onSuccess} renderHeading />
    </AuthModalShell>
  );
}
