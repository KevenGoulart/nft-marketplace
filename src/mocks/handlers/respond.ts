import { HttpResponse } from "msw";
import type { ApiError } from "@/api/contracts/common";
import {
  AvailabilityConflictError,
  ConflictError,
  CouponExpiredError,
  CouponInvalidError,
  IdempotencyConflictError,
  NotFoundError,
  QuoteOutdatedError,
  UnauthenticatedError,
  ValidationError,
} from "@/mocks/db/errors";

function errorBody(code: ApiError["error"]["code"], message: string, fields?: Record<string, string[]>): ApiError {
  return { error: { code, message, fields } };
}

export function errorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return HttpResponse.json(errorBody("VALIDATION_ERROR", error.message, error.fields), {
      status: 422,
    });
  }
  if (error instanceof UnauthenticatedError) {
    return HttpResponse.json(errorBody("UNAUTHENTICATED", error.message), { status: 401 });
  }
  if (error instanceof NotFoundError) {
    return HttpResponse.json(errorBody("NOT_FOUND", error.message), { status: 404 });
  }
  if (error instanceof ConflictError) {
    return HttpResponse.json(errorBody("CONFLICT", error.message), { status: 409 });
  }
  if (error instanceof AvailabilityConflictError) {
    return HttpResponse.json(errorBody("AVAILABILITY_CONFLICT", error.message), {
      status: 409,
    });
  }
  if (error instanceof QuoteOutdatedError) {
    return HttpResponse.json(errorBody("QUOTE_OUTDATED", error.message), { status: 409 });
  }
  if (error instanceof IdempotencyConflictError) {
    return HttpResponse.json(errorBody("IDEMPOTENCY_CONFLICT", error.message), {
      status: 409,
    });
  }
  if (error instanceof CouponInvalidError) {
    return HttpResponse.json(errorBody("COUPON_INVALID", error.message), { status: 400 });
  }
  if (error instanceof CouponExpiredError) {
    return HttpResponse.json(errorBody("COUPON_EXPIRED", error.message), { status: 410 });
  }

  console.error("[mocks] erro não mapeado", error);
  return HttpResponse.json(
    errorBody("TRANSIENT_FAILURE", "Falha inesperada na API simulada"),
    { status: 500 }
  );
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}
