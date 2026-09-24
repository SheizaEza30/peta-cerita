import { z } from "zod";
import { REPORT_REASONS } from "@/lib/constants";

/**
 * Schema validasi untuk Report.
 */
export const createReportSchema = z.object({
  reason: z
    .string()
    .min(1, "Alasan wajib dipilih")
    .refine(
      (val) => REPORT_REASONS.some((r) => r.value === val),
      "Alasan tidak valid"
    ),

  description: z
    .string()
    .max(1000, "Keterangan maksimal 1000 karakter")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// ============================================
// UPDATE REPORT (untuk moderator)
// ============================================
export const updateReportSchema = z.object({
  status: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]),
  reviewNote: z.string().max(1000).trim().optional().or(z.literal("")),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;