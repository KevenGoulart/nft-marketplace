import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSITION_MS = 200;

export function FiltersSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
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
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fechar filtros"
        onClick={close}
        className={cn(
          "fixed inset-0 cursor-pointer bg-background/80 transition-opacity duration-200 ease-out",
          shown ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        className={cn(
          "fixed inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl transition-transform duration-200 ease-out",
          shown ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">Filtros</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="cursor-pointer text-foreground hover:text-accent"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
