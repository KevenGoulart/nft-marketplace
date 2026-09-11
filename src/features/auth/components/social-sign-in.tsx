import { cn } from "@/lib/utils";

export function SocialSignIn({ variant = "modal" }: { variant?: "modal" | "screen" }) {
  return (
    <div className="flex w-full flex-col gap-3 pt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <p className="text-[13px] text-foreground">Ou continue com</p>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <div className={cn("flex flex-col gap-3", variant === "modal" && "px-20")}>
        <span
          aria-disabled="true"
          className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-border text-[13px] text-tertiary"
        >
          <GoogleGlyph />
          Continuar com Google
        </span>
        <span
          aria-disabled="true"
          className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-border text-[13px] text-tertiary"
        >
          <FacebookGlyph />
          Continuar com Facebook
        </span>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
      <path
        fill="#4086F4"
        d="M19.6 10.23c0-.68-.06-1.33-.17-1.95H10v3.69h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.26Z"
      />
      <path
        fill="#59C36A"
        d="M10 20c2.7 0 4.96-.89 6.61-2.42l-3.23-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.07v2.59A10 10 0 0 0 10 20Z"
      />
      <path
        fill="#FFDA2D"
        d="M4.41 11.92a5.99 5.99 0 0 1 0-3.84V5.49H1.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
      />
      <path
        fill="#FF641A"
        d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.5 9.5 0 0 0 10 0 10 10 0 0 0 1.07 5.49l3.34 2.59C5.2 5.72 7.4 3.96 10 3.96Z"
      />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#3B5999" />
      <path
        fill="#fff"
        d="M12.6 10.31h-1.7V16H8.5v-5.69H7.3V8.4h1.2V7.1c0-1 .48-2.55 2.55-2.55l1.87.01v2.07h-1.36c-.22 0-.53.11-.53.6v1.17h1.9l-.33 1.91Z"
      />
    </svg>
  );
}
