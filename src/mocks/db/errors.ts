export class NotFoundError extends Error {}
export class ConflictError extends Error {}
export class UnauthenticatedError extends Error {}
export class AvailabilityConflictError extends Error {}
export class IdempotencyConflictError extends Error {}
export class QuoteOutdatedError extends Error {}

export class CouponInvalidError extends Error {}
export class CouponExpiredError extends Error {}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string[]>
  ) {
    super(message);
  }
}
