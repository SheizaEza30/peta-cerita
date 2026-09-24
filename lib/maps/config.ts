/**
 * Konfigurasi MapLibre untuk PETA CERITA.
 */

export const MAP_CONFIG = {
  // Center Indonesia
  defaultCenter: [118, -2.5] as [number, number],
  defaultZoom: 4.5,
  minZoom: 3,
  maxZoom: 18,

  // Style URL — pakai demo tiles MapLibre (gratis, tidak butuh API key)
  // Ganti dengan MapTiler/Stadia jika mau style premium
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://demotiles.maplibre.org/style.json",

  // Attribution
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

  // Batas maksimal bounds (Asia Tenggara + Indonesia)
  maxBounds: [
    [90, -15], // Southwest
    [145, 10], // Northeast
  ] as [[number, number], [number, number]],
};

// Zoom level untuk trigger marker cluster
export const CLUSTER_MAX_ZOOM = 12;

// Ukuran batch fetch stories dari API
export const STORIES_FETCH_LIMIT = 500;

// Debounce untuk fetch saat map digeser (ms)
export const BOUNDS_FETCH_DEBOUNCE = 500;