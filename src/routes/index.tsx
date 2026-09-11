import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CatalogHero } from "@/features/catalog/components/hero";
import { MobileHero } from "@/features/catalog/components/mobile-hero";
import { MobileSearchBar } from "@/features/catalog/components/mobile-search-bar";
import { FiltersSheet } from "@/features/catalog/components/filters-sheet";
import { GenesisBanner } from "@/features/catalog/components/genesis-banner";
import { FiltersSidebar } from "@/features/catalog/components/filters-sidebar";
import { CatalogToolbar } from "@/features/catalog/components/toolbar";
import { MintingJournalSection } from "@/features/catalog/components/minting-journal";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  function updateSearch(patch: Partial<CatalogSearch>, options?: { replace?: boolean }) {
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: options?.replace,
      resetScroll: false,
    });
  }

  function clearFilters() {
    navigate({ search: DEFAULT_CATALOG_SEARCH, resetScroll: false });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="hidden md:block">
        <CatalogHero />
      </div>
      <div className="flex flex-col gap-4 md:hidden">
        <MobileSearchBar
          value={search.q}
          onChange={(q) => updateSearch({ q, page: 1 }, { replace: true })}
          onOpenFilters={() => setFiltersOpen(true)}
        />
        <MobileHero />
      </div>

      <div id="catalog-grid" className="flex flex-col gap-6 lg:flex-row">
        <div id="catalog-results" className="flex min-w-0 flex-1 flex-col gap-6">
          <CatalogToolbar search={search} onChange={updateSearch} />

          {query.isPending ? (
            <CatalogGridSkeleton />
          ) : query.isError ? (
            <CatalogErrorState onRetry={() => query.refetch()} />
          ) : query.data.items.length === 0 ? (
            <CatalogEmptyState onClear={clearFilters} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3 [&>*:nth-child(2n)]:mt-8 lg:[&>*:nth-child(2n)]:mt-0">
                {query.data.items.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
              </div>
              <div className="flex justify-center pt-8 lg:justify-end">
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

        <FiltersSidebar
          search={search}
          onChange={updateSearch}
          className="hidden md:order-first md:flex"
        />
      </div>

      <GenesisBanner />
      <MintingJournalSection />

      {filtersOpen ? (
        <FiltersSheet onClose={() => setFiltersOpen(false)}>
          <FiltersSidebar search={search} onChange={updateSearch} />
        </FiltersSheet>
      ) : null}
    </div>
  );
}
