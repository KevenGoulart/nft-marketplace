import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthBackdrop } from "./auth-backdrop";

const TRANSITION_MS = 200;

export function AuthModalShell({
  activeTab,
  subtitle,
  onClose,
  onTabChange,
  renderBackdrop = true,
  children,
}: {
  activeTab: "login" | "signup";
  subtitle: string;
  onClose: () => void;
  onTabChange: (tab: "login" | "signup") => void;
  renderBackdrop?: boolean;
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(closeTimeoutRef.current);
  }, []);

  function close() {
    if (closing) return;
    setClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, TRANSITION_MS);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = entered && !closing;

  return (
    <div className="fixed inset-0 z-50">
      {renderBackdrop ? <AuthBackdrop /> : null}
      <button
        type="button"
        aria-label="Fechar"
        onClick={close}
        className={cn(
          "fixed inset-0 cursor-pointer bg-background/80 transition-opacity duration-200 ease-out",
          shown ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center overflow-y-auto p-4 py-12 sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeTab === "login" ? "Entrar" : "Criar conta"}
          className={cn(
            "pointer-events-auto relative flex w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl transition-all duration-200 ease-out",
            shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
          )}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute right-4 top-4 cursor-pointer text-foreground hover:text-accent"
          >
            <X className="size-[18px]" aria-hidden />
          </button>

          <div className="flex flex-col items-center gap-10 px-12 pb-6 pt-12">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onTabChange("login")}
                aria-label="Ir para login"
                className={cn(
                  "cursor-pointer text-xl font-medium",
                  activeTab === "login" ? "text-accent" : "text-foreground"
                )}
              >
                Entrar
              </button>
              <span className="h-5 w-px bg-[#f0805f]" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onTabChange("signup")}
                aria-label="Ir para cadastro"
                className={cn(
                  "cursor-pointer text-xl font-medium",
                  activeTab === "signup" ? "text-accent" : "text-foreground"
                )}
              >
                Criar conta
              </button>
            </div>
            <p className="text-center text-[13px] text-foreground">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 h-[10px] w-full bg-primary" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
