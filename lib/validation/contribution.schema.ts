import { z } from "zod";
import { VALIDATION } from "@/lib/constants";

/**
 * Schema validasi untuk Contribution.
 * Sama dengan Story, tapi tanpa field moderasi.
 */
export const contributionBaseSchema = z.object({
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

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  address: z.string().max(500).trim().optional().or(z.literal("")),
  city: z.string().max(100).trim().optional().or(z.literal("")),
  province: z.string().max(100).trim().optional().or(z.literal("")),
  country: z.string().max(100).trim().default("Indonesia"),

  period: z.string().max(100).trim().optional().or(z.literal("")),
  source: z
    .string()
    .min(10, "Sumber/referensi minimal 10 karakter")
    .max(2000)
    .trim(),
  heroImage: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),

  confirmAccurate: z
    .boolean()
    .refine((val) => val === true, {
      message: "Anda harus mengonfirmasi bahwa kontribusi berdasarkan sumber yang dapat dipercaya",
    }),
});

export type ContributionBaseInput = z.infer<typeof contributionBaseSchema>;

// ============================================
// SUBMIT CONTRIBUTION
// ============================================
export const submitContributionSchema = contributionBaseSchema;
export type SubmitContributionInput = z.infer<typeof submitContributionSchema>;

// ============================================
// UPDATE / EDIT CONTRIBUTION
// ============================================
export const updateContributionSchema = contributionBaseSchema.partial();
export type UpdateContributionInput = z.infer<typeof updateContributionSchema>;

// ============================================
// APPROVE / REJECT (untuk moderator)
// ============================================
export const approveContributionSchema = z.object({
  note: z.string().max(500).trim().optional().or(z.literal("")),
});

export const rejectContributionSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Alasan penolakan minimal 10 karakter")
    .max(1000, "Alasan maksimal 1000 karakter")
    .trim(),
});

export type ApproveContributionInput = z.infer<typeof approveContributionSchema>;
export type RejectContributionInput = z.infer<typeof rejectContributionSchema>;