/**
 * Standar response API untuk PETA CERITA.
 * Format: { success, data?, error? }
 */

// ============================================
// TYPES
// ============================================
export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ============================================
// SUCCESS RESPONSES
// ============================================

/**
 * Response sukses 200.
 */
export function ok<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return Response.json(body, { status: 200, ...init });
}

/**
 * Response sukses 201 (created).
 */
export function created<T>(data: T): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return Response.json(body, { status: 201 });
}

/**
 * Response sukses 200 dengan pagination metadata.
 */
export function paginated<T>(
  data: T[],
  meta: {
    page: number;
    limit: number;
    total: number;
  }
): Response {
  const body: ApiSuccess<T[]> = {
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  };
  return Response.json(body, { status: 200 });
}

/**
 * Response sukses tanpa body (untuk DELETE).
 */
export function noContent(): Response {
  return new Response(null, { status: 204 });
}

// ============================================
// ERROR RESPONSES
// ============================================

/**
 * Response error dengan format standar.
 */
export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): Response {
  const body: ApiError = {
    success: false,
    error: { code, message, details },
  };
  return Response.json(body, { status });
}

/**
 * 400 — Bad Request (validasi gagal).
 */
export function badRequest(message: string, details?: unknown): Response {
  return error("BAD_REQUEST", message, 400, details);
}

/**
 * 401 — Unauthorized.
 */
export function unauthorized(message = "Anda harus login terlebih dahulu"): Response {
  return error("UNAUTHORIZED", message, 401);
}

/**
 * 403 — Forbidden (role tidak sesuai).
 */
export function forbidden(message = "Anda tidak memiliki akses"): Response {
  return error("FORBIDDEN", message, 403);
}

/**
 * 404 — Not Found.
 */
export function notFound(message = "Data tidak ditemukan"): Response {
  return error("NOT_FOUND", message, 404);
}

/**
 * 409 — Conflict (duplikat data).
 */
export function conflict(message: string): Response {
  return error("CONFLICT", message, 409);
}

/**
 * 422 — Unprocessable Entity (validasi Zod).
 */
export function validationError(details: unknown): Response {
  return error("VALIDATION_ERROR", "Data yang dikirim tidak valid", 422, details);
}

/**
 * 429 — Too Many Requests.
 */
export function tooManyRequests(message = "Terlalu banyak permintaan, coba lagi nanti"): Response {
  return error("TOO_MANY_REQUESTS", message, 429);
}

/**
 * 500 — Internal Server Error.
 */
export function serverError(message = "Terjadi kesalahan pada server"): Response {
  return error("INTERNAL_ERROR", message, 500);
}