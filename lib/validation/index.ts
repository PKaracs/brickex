import { z, ZodError } from "zod";

// Re-export all schemas for convenient imports
export * from "./schemas";

// ============================================================================
// Validation Helper Functions
// ============================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: z.ZodIssue[] };

/**
 * Validate input against a Zod schema
 * Returns typed data on success, or error message on failure
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      // Get the first error message for a clean user-facing message
      const firstError = error.issues[0];
      const path =
        firstError.path.length > 0 ? `${firstError.path.join(".")}: ` : "";
      return {
        success: false,
        error: `${path}${firstError.message}`,
        details: error.issues,
      };
    }
    return { success: false, error: "Entrada no valida" };
  }
}

/**
 * Safe parse that returns null on failure (for simple cases)
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Format Zod errors for API responses
 */
export function formatZodError(error: ZodError): {
  error: string;
  details: { path: string; message: string }[];
} {
  return {
    error: "Entrada no valida",
    details: error.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    })),
  };
}

/**
 * Create a standard 400 error response for API routes
 */
export function invalidInputResponse(
  message: string = "Entrada no valida",
  details?: z.ZodIssue[]
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      ...(details && {
        details: details.map((d) => ({
          path: d.path.join("."),
          message: d.message,
        })),
      }),
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
