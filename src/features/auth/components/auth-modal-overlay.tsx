import { AuthModalShell } from "./auth-modal-shell";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { useAuthModal } from "./auth-modal-context";

const SUBTITLES = {
  login: "Entre para gerenciar sua carteira, coleção e perfil de criador.",
  signup: "Cadastre-se para favoritar, comprar e acompanhar seus pedidos na Kurio.",
};

export function AuthModalOverlay() {
  const { openTab, open, close } = useAuthModal();

  if (!openTab) return null;

  return (
    <AuthModalShell
      activeTab={openTab}
      subtitle={SUBTITLES[openTab]}
      onClose={close}
      onTabChange={open}
      renderBackdrop={false}
    >
      {openTab === "login" ? (
        <LoginForm onSuccess={close} />
      ) : (
        <SignupForm onSuccess={close} />
      )}
    </AuthModalShell>
  );
}
