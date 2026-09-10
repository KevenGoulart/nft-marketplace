import { createFileRoute } from "@tanstack/react-router";
import { CatalogHero } from "@/features/catalog/components/hero";
import { FiltersSidebar } from "@/features/catalog/components/filters-sidebar";
import { CatalogToolbar } from "@/features/catalog/components/toolbar";
import { CatalogSearchInput } from "@/features/catalog/components/search-input";
import { NftCard } from "@/features/catalog/components/nft-card";
import { CatalogPagination } from "@/features/catalog/components/pagination";
import { CatalogGridSkeleton } from "@/features/catalog/components/catalog-grid-skeleton";
import {
  CatalogEmptyState,
  CatalogErrorState,
} from "@/features/catalog/components/catalog-status";
import { useNftsQuery } from "@/features/catalog/queries";
import {
  CATALOG_PAGE_SIZE,
  DEFAULT_CATALOG_SEARCH,
  catalogSearchSchema,
  type CatalogSearch,
} from "@/features/catalog/search-schema";

export const Route = createFileRoute("/")({
  validateSearch: catalogSearchSchema,
  component: HomePage,
});

function HomePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = useNftsQuery(search);

  function updateSearch(patch: Partial<CatalogSearch>, options?: { replace?: boolean }) {
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: options?.replace,
    });
  }

  function clearFilters() {
    navigate({ search: DEFAULT_CATALOG_SEARCH });
  }

  return (
    <div className="flex flex-col gap-10">
      <CatalogHero />

      <div id="catalog-grid" className="flex flex-col gap-6 lg:flex-row">
        <FiltersSidebar search={search} onChange={updateSearch} />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4">
            <CatalogSearchInput
              value={search.q}
              onChange={(q) => updateSearch({ q, page: 1 }, { replace: true })}
            />
            <CatalogToolbar search={search} onChange={updateSearch} />
          </div>

          {query.isPending ? (
            <CatalogGridSkeleton />
          ) : query.isError ? (
            <CatalogErrorState onRetry={() => query.refetch()} />
          ) : query.data.items.length === 0 ? (
            <CatalogEmptyState onClear={clearFilters} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                {query.data.items.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
              </div>
              <div className="flex justify-center lg:justify-end">
                <CatalogPagination
                  page={query.data.page}
                  pageSize={query.data.pageSize ?? CATALOG_PAGE_SIZE}
                  total={query.data.total}
                  onPageChange={(page) => updateSearch({ page })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
