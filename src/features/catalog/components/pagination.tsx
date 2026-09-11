import { cn } from "@/lib/utils";

export function CatalogPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginação do catálogo" className="flex items-center gap-2">
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-current={pageNumber === page ? "page" : undefined}
          onClick={() => onPageChange(pageNumber)}
          className={cn(
            "flex size-[35px] cursor-pointer items-center justify-center rounded text-lg",
            pageNumber === page
              ? "bg-primary font-bold text-primary-foreground"
              : "border border-border text-foreground hover:border-primary"
          )}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        aria-label="Próxima página"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="flex size-[35px] cursor-pointer items-center justify-center rounded border border-border text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 hover:border-primary"
      >
        <img
          src="/icons/arrow-right.svg"
          alt=""
          className="size-[18px] -rotate-90"
        />
      </button>
    </nav>
  );
}
