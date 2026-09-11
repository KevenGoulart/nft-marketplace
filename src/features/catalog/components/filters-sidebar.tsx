import { useState } from "react";
import { cn } from "@/lib/utils";
import { NETWORK_LABELS } from "@/lib/networks";
import { useCatalogFacetsQuery } from "../queries";
import type { CatalogSearch } from "../search-schema";
import { FeaturedCarousel } from "./featured-carousel";

export function FiltersSidebar({
  search,
  onChange,
  className,
}: {
  search: CatalogSearch;
  onChange: (patch: Partial<CatalogSearch>) => void;
  className?: string;
}) {
  const facets = useCatalogFacetsQuery();
  const bounds = facets.data ?? { minPrice: 0, maxPrice: 1, collections: [], networks: [] };

  const [draftMin, setDraftMin] = useState(bounds.minPrice);
  const [draftMax, setDraftMax] = useState(bounds.maxPrice);

  const [prevSignature, setPrevSignature] = useState<string | null>(null);
  const signature = facets.data
    ? `${search.minPrice ?? ""}:${search.maxPrice ?? ""}:${facets.data.minPrice}:${facets.data.maxPrice}`
    : null;
  if (facets.data && signature !== prevSignature) {
    setPrevSignature(signature);
    setDraftMin(search.minPrice ? Number(search.minPrice) : facets.data.minPrice);
    setDraftMax(search.maxPrice ? Number(search.maxPrice) : facets.data.maxPrice);
  }

  return (
    <aside
      aria-label="Filtros"
      className={cn("flex w-full flex-col gap-6 lg:w-[310px] lg:shrink-0", className)}
    >
      <div className="flex flex-col gap-10 rounded-xl bg-card p-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Coleções</h2>
        <ul className="flex flex-col px-3">
          {bounds.collections.map(([collection, count]) => {
            const active = search.collection === collection;
            return (
              <li key={collection}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange({
                      collection: active ? undefined : collection,
                      page: 1,
                    })
                  }
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between py-2 text-[15px]",
                    active
                      ? "font-bold text-accent"
                      : "text-secondary-foreground hover:text-foreground"
                  )}
                >
                  <span>{collection}</span>
                  <span className={active ? "font-bold" : ""}>({count})</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Faixa de preço</h2>
        <div className="flex flex-col gap-3 pl-3">
          <div className="relative flex h-5 w-full items-center">
            <input
              type="range"
              aria-label="Preço mínimo"
              min={bounds.minPrice}
              max={bounds.maxPrice}
              step={0.01}
              value={draftMin}
              onChange={(event) => {
                const value = Math.min(Number(event.target.value), draftMax);
                setDraftMin(value);
              }}
              className="range-thumb pointer-events-none absolute inset-x-0 h-1 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              aria-label="Preço máximo"
              min={bounds.minPrice}
              max={bounds.maxPrice}
              step={0.01}
              value={draftMax}
              onChange={(event) => {
                const value = Math.max(Number(event.target.value), draftMin);
                setDraftMax(value);
              }}
              className="range-thumb pointer-events-none absolute inset-x-0 h-1 w-full appearance-none bg-transparent"
            />
            <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-border" />
            <div
              className="pointer-events-none absolute h-1 rounded-full bg-primary"
              style={{
                left: `${((draftMin - bounds.minPrice) / (bounds.maxPrice - bounds.minPrice || 1)) * 100}%`,
                right: `${100 - ((draftMax - bounds.minPrice) / (bounds.maxPrice - bounds.minPrice || 1)) * 100}%`,
              }}
            />
          </div>
          <p className="text-[15px] text-foreground">
            Preço: {draftMin.toFixed(2)} - {draftMax.toFixed(2)} ETH
          </p>
          <button
            type="button"
            onClick={() =>
              onChange({
                minPrice: draftMin > bounds.minPrice ? String(draftMin) : undefined,
                maxPrice: draftMax < bounds.maxPrice ? String(draftMax) : undefined,
                page: 1,
              })
            }
            className="flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-2 text-base font-bold text-primary-foreground"
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Rede</h2>
        <ul className="flex flex-col pl-3 text-[15px]">
          {bounds.networks.map(([network, count]) => {
            const active = search.network === network;
            return (
              <li key={network}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange({ network: active ? undefined : network, page: 1 })
                  }
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between py-2",
                    active
                      ? "font-bold text-accent"
                      : "text-secondary-foreground hover:text-foreground"
                  )}
                >
                  <span>{NETWORK_LABELS[network]}</span>
                  <span>({count})</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      </div>

      <FeaturedCarousel />
    </aside>
  );
}
