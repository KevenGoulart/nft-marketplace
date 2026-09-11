import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CatalogSearch } from "../search-schema";
import type { NftSort } from "@/api/contracts/nft";

const SORT_OPTIONS: { value: NftSort; label: string }[] = [
  { value: "recent", label: "Listados recentemente" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "trending", label: "Em alta" },
];

export function CatalogToolbar({
  search,
  onChange,
}: {
  search: CatalogSearch;
  onChange: (patch: Partial<CatalogSearch>) => void;
}) {
  const [recentTab, setRecentTab] = useState<"all" | "new">("all");
  const activeTab =
    search.sort === "trending" ? "trending" : search.sort === "recent" ? recentTab : null;

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div role="group" aria-label="Filtrar catálogo" className="flex gap-5 text-[15px] font-medium">
        <button
          type="button"
          aria-pressed={activeTab === "all"}
          onClick={() => {
            setRecentTab("all");
            onChange({ sort: "recent", page: 1 });
          }}
          className={cn(
            "cursor-pointer border-b-2 border-transparent pb-1",
            activeTab === "all" ? "border-accent font-bold text-accent" : "text-foreground"
          )}
        >
          Todos os NFTs
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "new"}
          onClick={() => {
            setRecentTab("new");
            onChange({ sort: "recent", page: 1 });
          }}
          className={cn(
            "cursor-pointer border-b-2 border-transparent pb-1",
            activeTab === "new" ? "border-accent font-bold text-accent" : "text-foreground"
          )}
        >
          Novos lançamentos
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "trending"}
          onClick={() => onChange({ sort: "trending", page: 1 })}
          className={cn(
            "cursor-pointer border-b-2 border-transparent pb-1",
            activeTab === "trending" ? "border-accent font-bold text-accent" : "text-foreground"
          )}
        >
          Em alta
        </button>
      </div>

      <label className="flex items-center gap-2 text-[15px] text-foreground">
        Ordenar por:
        <span className="relative">
          <select
            value={search.sort}
            onChange={(event) =>
              onChange({ sort: event.target.value as NftSort, page: 1 })
            }
            className="appearance-none rounded-md bg-transparent py-1 pr-6 pl-1 text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-card">
                {option.label}
              </option>
            ))}
          </select>
          <img
            src="/icons/arrow-down.svg"
            alt=""
            className="pointer-events-none absolute right-1 top-1/2 size-3 -translate-y-1/2"
          />
        </span>
      </label>
    </div>
  );
}
