import { Button } from "@/components/ui/button";

export function CatalogEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-xl border border-border py-16 text-center"
    >
      <p className="text-lg font-bold text-foreground">Nenhum NFT encontrado</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tente ajustar a busca ou remover alguns filtros para ver mais
        resultados.
      </p>
      <Button variant="outline" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}

export function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/40 py-16 text-center"
    >
      <p className="text-lg font-bold text-foreground">
        Não foi possível carregar o catálogo
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Houve uma falha ao buscar os NFTs. Verifique sua conexão e tente
        novamente.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
