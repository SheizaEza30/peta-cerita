import { z } from "zod";
import { VALIDATION } from "@/lib/constants";

/**
 * Schema validasi untuk authentication.
 */

// ============================================
// REGISTER
// ============================================
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .trim(),

    username: z
      .string()
      .min(
        VALIDATION.MIN_USERNAME_LENGTH,
        `Username minimal ${VALIDATION.MIN_USERNAME_LENGTH} karakter`
      )
      .max(
        VALIDATION.MAX_USERNAME_LENGTH,
        `Username maksimal ${VALIDATION.MAX_USERNAME_LENGTH} karakter`
      )
      .regex(
        /^[a-z0-9_]+$/,
        "Username hanya boleh huruf kecil, angka, dan underscore"
      )
      .trim()
      .toLowerCase(),

    email: z
      .string()
      .email("Format email tidak valid")
      .max(255, "Email maksimal 255 karakter")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(
        VALIDATION.MIN_PASSWORD_LENGTH,
        `Password minimal ${VALIDATION.MIN_PASSWORD_LENGTH} karakter`
      )
      .max(
        VALIDATION.MAX_PASSWORD_LENGTH,
        `Password maksimal ${VALIDATION.MAX_PASSWORD_LENGTH} karakter`
      )
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// LOGIN
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .trim()
    .toLowerCase(),

  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim()
    .optional(),

  bio: z
    .string()
    .max(500, "Bio maksimal 500 karakter")
    .trim()
    .optional()
    .or(z.literal("")),

  avatar: z
    .string()
    .url("URL avatar tidak valid")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(
        VALIDATION.MIN_PASSWORD_LENGTH,
        `Password minimal ${VALIDATION.MIN_PASSWORD_LENGTH} karakter`
      )
      .max(
        VALIDATION.MAX_PASSWORD_LENGTH,
        `Password maksimal ${VALIDATION.MAX_PASSWORD_LENGTH} karakter`
      )
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;