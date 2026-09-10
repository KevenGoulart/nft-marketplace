import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export function CatalogSearchInput({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value ?? "");
  }

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const trimmed = draft.trim();
    const timeout = setTimeout(() => {
      if (trimmed !== (valueRef.current ?? "")) {
        onChangeRef.current(trimmed || undefined);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [draft]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <img
        src="/icons/search.svg"
        alt=""
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-70"
      />
      <Input
        id="catalog-search-input"
        type="search"
        role="searchbox"
        placeholder="Buscar NFTs ou coleções"
        aria-label="Buscar NFTs ou coleções"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
