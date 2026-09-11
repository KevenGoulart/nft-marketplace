import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AuthModalTab = "login" | "signup";

type AuthModalContextValue = {
  openTab: AuthModalTab | null;
  open: (tab: AuthModalTab) => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [openTab, setOpenTab] = useState<AuthModalTab | null>(null);

  const value = useMemo<AuthModalContextValue>(
    () => ({
      openTab,
      open: (tab) => setOpenTab(tab),
      close: () => setOpenTab(null),
    }),
    [openTab]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal deve ser usado dentro de um AuthModalProvider");
  }
  return context;
}
