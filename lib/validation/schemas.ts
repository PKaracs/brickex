import { z } from "zod";

// ============================================================================
// Reusable Primitives
// ============================================================================

/**
 * CUID format validation (paralleldrive/cuid2 generates 24-char IDs)
 * Allows 20-32 chars to be safe with different CUID implementations
 */
export const cuidSchema = z
  .string()
  .min(20, "Formato de ID no valido")
  .max(32, "Formato de ID no valido")
  .regex(/^[a-z0-9]+$/, "Formato de ID no valido");

/**
 * Short text fields (names, titles, etc.)
 */
export const shortTextSchema = z
  .string()
  .max(100, "Texto demasiado largo (maximo 100 caracteres)");

/**
 * Long text fields (descriptions, prompts, etc.)
 */
export const longTextSchema = z
  .string()
  .max(2000, "Texto demasiado largo (maximo 2000 caracteres)");

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Correo no valido")
  .max(254, "Correo demasiado largo");

// ============================================================================
// Project Schemas
// ============================================================================

export const sourceTypeSchema = z.enum(["avatar", "upload"]);

export const projectStatusSchema = z.enum([
  "draft",
  "processing",
  "complete",
  "failed",
]);

/**
 * Create project input - minimal, optional input
 */
export const createProjectInputSchema = z
  .object({
    sourceType: sourceTypeSchema.optional(),
  })
  .strict()
  .optional()
  .nullable();

/**
 * Update project input - all fields optional
 */
export const updateProjectInputSchema = z
  .object({
    templateId: cuidSchema.nullable().optional(),
    advancedSettings: z.record(z.string(), z.unknown()).nullable().optional(),
    customPrompt: longTextSchema.nullable().optional(),
    status: projectStatusSchema.optional(),
    sourceType: sourceTypeSchema.optional(),
  })
  .strict();

/**
 * Project ID validation
 */
export const projectIdSchema = cuidSchema;

/**
 * Template ID validation (can be numeric string or CUID)
 */
export const templateIdSchema = z.string().min(1).max(32);

// ============================================================================
// Object Selection Schemas
// ============================================================================

export const objectSelectionSchema = z.object({
  objectId: z.string().max(50).optional(),
  objectType: shortTextSchema,
  objectName: shortTextSchema,
});

export const objectSelectionsArraySchema = z
  .array(objectSelectionSchema)
  .max(10, "Maximum 10 objects allowed");

// ============================================================================
// Avatar Schemas
// ============================================================================

/**
 * Avatar setup request (creates avatar + gets upload URLs)
 */
export const avatarSetupSchema = z
  .object({
    fileCount: z
      .number()
      .int("La cantidad de archivos debe ser un numero entero")
      .min(1, "Se requiere al menos 1 archivo")
      .max(5, "Maximo 5 archivos permitidos"),
  })
  .strict();

/**
 * Avatar confirm request (confirms uploads completed)
 */
export const avatarConfirmFileSchema = z.object({
  storageKey: z.string().min(1).max(500),
  name: shortTextSchema,
  size: z
    .number()
    .int()
    .min(0)
    .max(50 * 1024 * 1024), // Max 50MB
});

export const avatarConfirmSchema = z
  .object({
    avatarId: cuidSchema,
    files: z
      .array(avatarConfirmFileSchema)
      .min(1, "Se requiere al menos 1 archivo")
      .max(5, "Maximo 5 archivos permitidos"),
  })
  .strict();

// ============================================================================
// Project Image Upload Schemas (direct-to-storage)
// ============================================================================

export const projectImagesSetupSchema = z
  .object({
    projectId: cuidSchema,
    fileCount: z
      .number()
      .int("La cantidad de archivos debe ser un numero entero")
      .min(1, "Se requiere al menos 1 archivo")
      .max(5, "Maximo 5 archivos permitidos"),
  })
  .strict();

export const projectImagesConfirmFileSchema = z.object({
  storageKey: z.string().min(1).max(500),
  name: shortTextSchema,
  type: z.string().min(1).max(200),
  size: z
    .number()
    .int()
    .min(0)
    .max(50 * 1024 * 1024), // Max 50MB
});

export const projectImagesConfirmSchema = z
  .object({
    projectId: cuidSchema,
    files: z
      .array(projectImagesConfirmFileSchema)
      .min(1, "Se requiere al menos 1 archivo")
      .max(5, "Maximo 5 archivos permitidos"),
  })
  .strict();

// ============================================================================
// Teleport / Street View Schemas
// ============================================================================

export const streetViewRequestSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    heading: z.number().min(0).max(360).optional(),
    pitch: z.number().min(-90).max(90).optional(),
    fov: z.number().min(10).max(120).optional(),
  })
  .strict();

// ============================================================================
// Meta Tracking Schema
// ============================================================================

export const metaTrackingSchema = z
  .object({
    fbp: z.string().max(200).nullable(),
    fbc: z.string().max(200).nullable(),
    userAgent: z.string().max(500),
    purchaseEventId: z.string().max(100).optional(), // For Purchase event deduplication
  })
  .strict();

export const checkoutTrackingSchema = z
  .object({
    productId: z.enum(["starter", "pro", "studio"]),
    eventId: z.string().min(1).max(100),
    purchaseEventId: z.string().min(1).max(100),
    checkoutValue: z.number().finite().nonnegative().max(100000),
    currency: z.string().trim().length(3).default("USD"),
    source: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

// ============================================================================
// Type Exports (for TypeScript inference)
// ============================================================================

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type ObjectSelection = z.infer<typeof objectSelectionSchema>;
export type AvatarSetupInput = z.infer<typeof avatarSetupSchema>;
export type AvatarConfirmInput = z.infer<typeof avatarConfirmSchema>;
export type ProjectImagesSetupInput = z.infer<typeof projectImagesSetupSchema>;
export type ProjectImagesConfirmInput = z.infer<
  typeof projectImagesConfirmSchema
>;
export type StreetViewRequest = z.infer<typeof streetViewRequestSchema>;
export type MetaTrackingInput = z.infer<typeof metaTrackingSchema>;
export type CheckoutTrackingInput = z.infer<typeof checkoutTrackingSchema>;
