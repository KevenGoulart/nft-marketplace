import { Skeleton } from "@/components/ui/skeleton";
import { CATALOG_PAGE_SIZE } from "../search-schema";

function NftCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[258/300] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}

export function CatalogGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando catálogo de NFTs"
      className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: CATALOG_PAGE_SIZE }, (_, i) => (
        <NftCardSkeleton key={i} />
      ))}
    </div>
  );
}
