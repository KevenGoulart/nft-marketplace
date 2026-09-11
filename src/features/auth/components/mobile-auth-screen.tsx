import { Link } from "@tanstack/react-router";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function MobileAuthScreen({
  tab,
  onSuccess,
}: {
  tab: "login" | "signup";
  onSuccess: () => void;
}) {
  return (
    <div className="-mx-4 -mt-6 flex flex-col items-center gap-10 px-7 pt-[52px]">
      <div className="flex h-[136px] w-full items-center justify-center">
        <p className="text-center text-[32px] font-bold tracking-[3.2px] text-foreground">
          KURIO
        </p>
      </div>

      {tab === "login" ? (
        <>
          <h1 className="w-full text-center text-xl font-bold text-foreground">Entrar</h1>
          <LoginForm onSuccess={onSuccess} variant="screen" />
          <Link to="/signup" className="text-[15px] text-secondary-foreground">
            Novo na Kurio? Crie uma conta
          </Link>
        </>
      ) : (
        <>
          <h1 className="w-full text-center text-lg font-bold text-foreground">
            Criar perfil de colecionador
          </h1>
          <SignupForm onSuccess={onSuccess} variant="screen" />
          <Link to="/login" className="text-[15px] text-secondary-foreground">
            Já tem uma conta? Entre
          </Link>
        </>
      )}
    </div>
  );
}
