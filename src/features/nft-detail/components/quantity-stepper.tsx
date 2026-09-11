import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  default: { button: "size-[35px]", icon: "size-4", value: "min-w-6 text-xl" },
  sm: { button: "size-[24px]", icon: "size-3", value: "min-w-4 text-base" },
} as const;

export function QuantityStepper({
  value,
  max,
  onChange,
  size = "default",
  disabled = false,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  size?: keyof typeof SIZE_CLASSES;
  disabled?: boolean;
}) {
  const classes = SIZE_CLASSES[size];

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Quantidade">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
          classes.button
        )}
      >
        <Minus className={classes.icon} aria-hidden />
      </button>
      <span aria-live="polite" className={cn("text-center text-foreground", classes.value)}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
          classes.button
        )}
      >
        <Plus className={classes.icon} aria-hidden />
      </button>
    </div>
  );
}
