import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormField({
  id,
  label,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const errorId = `${id}-error`;

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
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-0.5 text-[#f0805f]" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {field}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
