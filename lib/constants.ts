/**
 * Konstanta global aplikasi PETA CERITA.
 */

// ============================================
// APP
// ============================================
export const APP_NAME = "Peta Cerita";
export const APP_DESCRIPTION =
  "Platform peta interaktif berisi cerita, sejarah, budaya, legenda, dan pengetahuan lokal Indonesia.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================
// KATEGORI CERITA
// ============================================
export const CATEGORIES = [
  { slug: "sejarah", name: "Sejarah", icon: "Landmark", color: "#b45309" },
  { slug: "legenda", name: "Legenda", icon: "Sparkles", color: "#7c3aed" },
  { slug: "budaya", name: "Budaya", icon: "Palette", color: "#0891b2" },
  { slug: "tokoh", name: "Tokoh", icon: "User", color: "#dc2626" },
  { slug: "kuliner", name: "Kuliner", icon: "UtensilsCrossed", color: "#ea580c" },
  { slug: "tradisi", name: "Tradisi", icon: "Drama", color: "#16a34a" },
  { slug: "tempat", name: "Tempat Bersejarah", icon: "Building2", color: "#2563eb" },
  { slug: "cerita-rakyat", name: "Cerita Rakyat", icon: "BookOpen", color: "#c026d3" },
  { slug: "edukasi", name: "Edukasi", icon: "GraduationCap", color: "#0d9488" },
  { slug: "misteri", name: "Misteri", icon: "Eye", color: "#4c1d95" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// ============================================
// POIN
// ============================================
export const POINTS = {
  SUBMIT: parseInt(process.env.POINTS_SUBMIT || "5", 10),
  APPROVED: parseInt(process.env.POINTS_APPROVED || "50", 10),
  ACHIEVEMENT: parseInt(process.env.POINTS_ACHIEVEMENT || "100", 10),
} as const;

// ============================================
// ACHIEVEMENT
// ============================================
export const ACHIEVEMENT_RULES = {
  FIRST_STORY: { name: "First Story", threshold: 1 },
  STORYTELLER: { name: "Storyteller", threshold: 5 },
  HISTORIAN: { name: "Historian", threshold: 10 },
  MASTER_CONTRIBUTOR: { name: "Master Contributor", threshold: 25 },
  LOCAL_EXPLORER: { name: "Local Explorer", threshold: 5 }, // baca 5 daerah
} as const;

// ============================================
// STORY
// ============================================
export const STORY_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export const CONTRIBUTION_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

// ============================================
// ROLE
// ============================================
export const ROLES = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

// ============================================
// MAP
// ============================================
export const MAP_DEFAULTS = {
  CENTER: [112.5, -2.5] as [number, number], // Indonesia center
  ZOOM: 4,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  STYLE_URL:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://demotiles.maplibre.org/style.json",
} as const;

// ============================================
// PAGINATION
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================
// VALIDATION
// ============================================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_TITLE_LENGTH: 200,
  MAX_SYNOPSIS_LENGTH: 500,
  MAX_CONTENT_LENGTH: 50000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ],
} as const;

// ============================================
// REPORT REASONS
// ============================================
export const REPORT_REASONS = [
  { value: "informasi-salah", label: "Informasi salah" },
  { value: "copyright", label: "Pelanggaran hak cipta" },
  { value: "tidak-relevan", label: "Tidak relevan" },
  { value: "konten-tidak-pantas", label: "Konten tidak pantas" },
  { value: "spam", label: "Spam" },
  { value: "lainnya", label: "Lainnya" },
] as const;

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  CONTRIBUTE: "/contribute",
  SETTINGS: "/settings",
  ADMIN: "/admin",
  story: (slug: string) => `/story/${slug}`,
} as const;