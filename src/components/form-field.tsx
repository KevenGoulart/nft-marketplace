import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormField({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  const errorId = `${id}-error`;

  // Liga a mensagem de erro ao campo via aria-describedby automaticamente: deixar isso a
  // cargo de cada formulário que usa FormField é fácil de esquecer (e a maioria dos
  // consumidores esquecia, quebrando a associação exigida pelo §8 mesmo com aria-invalid
  // presente). Preserva um aria-describedby que o próprio campo já traga.
  const field =
    error && isValidElement(children)
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
          "aria-describedby": [
            (children.props as { "aria-describedby"?: string })["aria-describedby"],
            errorId,
          ]
            .filter(Boolean)
            .join(" "),
        })
      : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {field}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
