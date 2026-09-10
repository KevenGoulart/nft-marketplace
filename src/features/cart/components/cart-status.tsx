import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CartEmptyState() {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-xl border border-border py-16 text-center"
    >
      <p className="text-lg font-bold text-foreground">Seu carrinho está vazio</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Explore o catálogo e adicione NFTs para vê-los aqui.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Explorar catálogo</Link>
      </Button>
    </div>
  );
}

export function CartErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/40 py-16 text-center"
    >
      <p className="text-lg font-bold text-foreground">Não foi possível carregar o carrinho</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Houve uma falha ao buscar seu carrinho. Verifique sua conexão e tente novamente.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
