import { useEffect, useState } from "react";
import type { NftSummary } from "@/api/contracts/nft";
import { cn } from "@/lib/utils";
import { NftCard } from "./nft-card";

const PAGE_SIZE = 5;
export const CAROUSEL_MAX_POOL_SIZE = PAGE_SIZE * 3;
const ROTATE_INTERVAL_MS = 5000;

export function ProductCarousel({
  title,
  resetKey,
  pool,
  pairOnMobile = false,
}: {
  title: string;
  resetKey: string;
  pool: NftSummary[];
  pairOnMobile?: boolean;
}) {
  const pages: NftSummary[][] = [];
  for (let i = 0; i < pool.length; i += PAGE_SIZE) pages.push(pool.slice(i, i + PAGE_SIZE));

  const [activePage, setActivePage] = useState(0);

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setActivePage(0);
  }

  useEffect(() => {
    if (pages.length < 2) return;
    const timer = setInterval(() => {
      setActivePage((page) => (page + 1) % pages.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pages.length]);

  if (pages.length === 0) return null;

  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-3 text-base font-bold text-accent">{title}</h2>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {pages.map((pageItems, pageIndex) => (
            <div
              key={pageIndex}
              className={cn(
                "grid w-full shrink-0 grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5",
                pairOnMobile && "[&>*:nth-child(5)]:hidden sm:[&>*:nth-child(5)]:grid"
              )}
            >
              {pageItems.map((nft) => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {pages.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ver página ${index + 1} de ${title.toLowerCase()}`}
              aria-current={index === activePage}
              onClick={() => setActivePage(index)}
              className={
                index === activePage
                  ? "size-3 cursor-pointer rounded-full bg-primary"
                  : "size-3 cursor-pointer rounded-full bg-border"
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
