import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiRequestError } from "@/api/contracts/common";

export function applyApiErrorToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): string {
  if (error instanceof ApiRequestError) {
    if (error.body.error.fields) {
      for (const [field, messages] of Object.entries(error.body.error.fields)) {
        if (messages[0]) {
          setError(field as Path<T>, { message: messages[0] });
        }
      }
    }
    return error.body.error.message;
  }
  return "Falha inesperada. Tente novamente.";
}
