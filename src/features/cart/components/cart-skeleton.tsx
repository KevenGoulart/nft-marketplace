import { Skeleton } from "@/components/ui/skeleton";

function ItemSkeleton() {
  return (
    <div className="flex h-[70px] items-center gap-4 rounded-md bg-card px-4 py-3 md:h-[70px]">
      <Skeleton className="size-[70px] shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="hidden h-4 w-16 md:block" />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando carrinho"
      className="flex flex-col items-start justify-between gap-8 md:flex-row"
    >
      <div className="flex w-full flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-4 md:w-[332px]">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
