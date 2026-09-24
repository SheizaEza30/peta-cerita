import { z } from "zod";
import { VALIDATION, CATEGORIES } from "@/lib/constants";

/**
 * Schema validasi untuk Story & Contribution.
 */

// ============================================
// STORY BASE (dipakai di create & update)
// ============================================
export const storyBaseSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(VALIDATION.MAX_TITLE_LENGTH, `Judul maksimal ${VALIDATION.MAX_TITLE_LENGTH} karakter`)
    .trim(),

  synopsis: z
    .string()
    .min(20, "Sinopsis minimal 20 karakter")
    .max(VALIDATION.MAX_SYNOPSIS_LENGTH, `Sinopsis maksimal ${VALIDATION.MAX_SYNOPSIS_LENGTH} karakter`)
    .trim(),

  content: z
    .string()
    .min(100, "Isi cerita minimal 100 karakter")
    .max(VALIDATION.MAX_CONTENT_LENGTH, `Isi cerita maksimal ${VALIDATION.MAX_CONTENT_LENGTH} karakter`)
    .trim(),

  categoryId: z.string().min(1, "Kategori wajib dipilih"),

  // Lokasi
  latitude: z
    .number()
    .min(-90, "Latitude minimal -90")
    .max(90, "Latitude maksimal 90"),

  longitude: z
    .number()
    .min(-180, "Longitude minimal -180")
    .max(180, "Longitude maksimal 180"),

  address: z.string().max(500).trim().optional().or(z.literal("")),
  city: z.string().max(100).trim().optional().or(z.literal("")),
  province: z.string().max(100).trim().optional().or(z.literal("")),
  country: z.string().max(100).trim().default("Indonesia"),

  // Metadata
  period: z.string().max(100).trim().optional().or(z.literal("")),
  source: z
    .string()
    .min(10, "Sumber/referensi minimal 10 karakter")
    .max(2000)
    .trim()
    .optional()
    .or(z.literal("")),

  heroImage: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),

  // Konfirmasi sumber
  confirmAccurate: z
    .boolean()
    .refine((val) => val === true, {
      message: "Anda harus mengonfirmasi bahwa kontribusi berdasarkan sumber yang dapat dipercaya",
    }),
});

export type StoryBaseInput = z.infer<typeof storyBaseSchema>;

// ============================================
// CREATE STORY / CONTRIBUTION
// ============================================
export const createStorySchema = storyBaseSchema;
export type CreateStoryInput = z.infer<typeof createStorySchema>;

// ============================================
// UPDATE STORY
// ============================================
export const updateStorySchema = storyBaseSchema.partial().extend({
  confirmAccurate: z.boolean().optional(),
});
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;

// ============================================
// REJECT CONTRIBUTION
// ============================================
export const rejectContributionSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Alasan penolakan minimal 10 karakter")
    .max(1000, "Alasan maksimal 1000 karakter")
    .trim(),
});
export type RejectContributionInput = z.infer<typeof rejectContributionSchema>;

// ============================================
// STORY FILTER / QUERY PARAMS
// ============================================
export const storyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  authorId: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED"]).optional(),

  // Bounding box untuk map: minLng,minLat,maxLng,maxLat
  bounds: z.string().optional(),

  sortBy: z.enum(["recent", "popular", "relevance"]).default("recent"),
});

export type StoryQueryInput = z.infer<typeof storyQuerySchema>;

// ============================================
// HELPER: Parse bounds
// ============================================
export function parseBounds(bounds?: string) {
  if (!bounds) return null;

  const parts = bounds.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;

  const [minLng, minLat, maxLng, maxLat] = parts;

  // Validasi range
  if (minLat < -90 || maxLat > 90 || minLng < -180 || maxLng > 180) {
    return null;
  }

  return { minLng, minLat, maxLng, maxLat };
}

// ============================================
// HELPER: Validasi slug kategori
// ============================================
export const categorySlugSchema = z.object({
  slug: z.string().refine(
    (val) => CATEGORIES.some((c) => c.slug === val),
    "Kategori tidak valid"
  ),
});