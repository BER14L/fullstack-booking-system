/**
 * Typed HTTP error.
 *
 * Throwing `ApiError` anywhere in the service layer lets the central error
 * middleware convert it into a well-formed JSON response with the right status
 * code. Everything else is treated as a 500.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    // Maintain prototype chain for `instanceof` checks across compile targets.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(msg = "Bad request", details?: unknown) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Conflict", details?: unknown) {
    return new ApiError(409, msg, details);
  }
  static internal(msg = "Internal server error") {
    return new ApiError(500, msg);
  }
}
