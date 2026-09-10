import { X } from "lucide-react";
import { useRealtimeNotices } from "../notices";

export function RealtimeNotices() {
  const { notices, dismiss } = useRealtimeNotices();

  if (notices.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2" aria-live="polite">
      {notices.map((notice) => (
        <li
          key={notice.id}
          role="status"
          className="flex items-center justify-between gap-3 rounded-md border border-accent/60 bg-accent/10 px-4 py-3 text-sm text-foreground"
        >
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Dispensar aviso"
            onClick={() => dismiss(notice.id)}
            className="shrink-0 text-foreground/80 hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
