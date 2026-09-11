import { SlidersHorizontal } from "lucide-react";
import { CatalogSearchInput } from "./search-input";

export function MobileSearchBar({
  value,
  onChange,
  onOpenFilters,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onOpenFilters: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <CatalogSearchInput value={value} onChange={onChange} />
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label="Abrir filtros"
        className="flex size-[45px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-gradient-to-br from-primary/45 to-primary text-primary-foreground"
      >
        <SlidersHorizontal className="size-[22px]" aria-hidden />
      </button>
    </div>
  );
}
