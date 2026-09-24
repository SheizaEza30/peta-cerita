import {
  Landmark,
  Sparkles,
  Palette,
  User,
  UtensilsCrossed,
  Drama,
  Building2,
  BookOpen,
  GraduationCap,
  Eye,
  MapPin,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon Lucide per kategori cerita.
 * Nama icon di database = key di sini.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Landmark,
  Sparkles,
  Palette,
  User,
  UtensilsCrossed,
  Drama,
  Building2,
  BookOpen,
  GraduationCap,
  Eye,
  MapPin, // fallback
};

/**
 * Ambil icon berdasarkan nama string.
 * Return MapPin sebagai fallback.
 */
export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return MapPin;
  return CATEGORY_ICONS[iconName] ?? MapPin;
}

/**
 * Default marker color kalau kategori tidak punya color.
 */
export const DEFAULT_MARKER_COLOR = "#1f9d69";