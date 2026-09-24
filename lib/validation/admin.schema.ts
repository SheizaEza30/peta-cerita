import { z } from "zod";

/**
 * Schema validasi untuk admin actions.
 */

// Update role user
export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"], {
    errorMap: () => ({ message: "Role harus USER, MODERATOR, atau ADMIN" }),
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// Update points (bonus/adjustment)
export const updateUserPointsSchema = z.object({
  points: z
    .number()
    .int("Poin harus angka bulat")
    .refine((val) => val !== 0, "Poin tidak boleh 0"),
  description: z
    .string()
    .min(5, "Deskripsi minimal 5 karakter")
    .max(200, "Deskripsi maksimal 200 karakter")
    .trim(),
});

export type UpdateUserPointsInput = z.infer<typeof updateUserPointsSchema>;

// ============================================
// CATEGORY
// ============================================
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(50, "Nama kategori maksimal 50 karakter")
    .trim(),

  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .max(50, "Slug maksimal 50 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda minus"
    )
    .trim()
    .toLowerCase(),

  icon: z.string().max(50).trim().optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format hex (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500).trim().optional().or(z.literal("")),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;