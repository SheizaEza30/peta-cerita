# 🗺️ PETA CERITA

**Platform peta interaktif berisi cerita, sejarah, budaya, legenda, dan pengetahuan lokal Indonesia.**

Setiap titik di peta bukan hanya menunjukkan lokasi, tapi berisi cerita edukatif yang dapat dibaca atau didengarkan.

![Peta Cerita](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Fitur

### Untuk Pengunjung (Guest)
- 🗺️ **Peta Interaktif** — MapLibre GL JS dengan marker berwarna per kategori
- 📖 **Cerita Detail** — Split-screen view dengan hero image
- 🎧 **Mode Dongeng** — Text-to-Speech untuk anak-anak (Web Speech API)
- 🔍 **Pencarian** — Cari cerita berdasarkan judul, kota, kategori
- 📱 **Responsive** — Desktop, tablet, dan mobile (PWA installable)

### Untuk Kontributor (User)
- ✍️ **Submit Cerita** — Form lengkap dengan peta pemilih lokasi
- 💾 **Simpan Cerita** — Bookmark untuk dibaca nanti
- 🏆 **Achievement** — Unlock achievement dengan kontribusi
- ⭐ **Point System** — Dapatkan poin dari kontribusi
- 👤 **Profile** — Statistik, kontribusi, riwayat baca, achievement

### Untuk Moderator/Admin
- 🎛️ **Dashboard** — Statistik real-time (users, stories, contributions, reports)
- ✅ **Moderation Queue** — Approve/reject kontribusi dengan alasan
- 🚩 **Reports Management** — Kelola laporan user
- 👥 **User Management** — Kelola role & user
- 🏷️ **Category Management** — CRUD kategori

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|---|---|---|
| **Next.js** | 15.5.26 | Framework (App Router, Turbopack) |
| **React** | 19.0.0 | UI Library |
| **TypeScript** | 5.7 | Type safety |
| **Tailwind CSS** | 3.4 | Styling |
| **shadcn/ui** | Latest | Komponen UI (Radix UI) |
| **Framer Motion** | 11.13 | Animasi |
| **TanStack Query** | 5.62 | Data fetching |
| **Zustand** | 5.0 | State management |

### Backend
| Teknologi | Versi | Fungsi |
|---|---|---|
| **Next.js Route Handlers** | 15 | REST API (Node.js runtime) |
| **Prisma** | 6.19 | ORM |
| **PostgreSQL** | 16 (Neon) | Database |
| **Auth.js (NextAuth)** | 5.0-beta | Authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **Zod** | 3.24 | Validasi schema |

### Maps & Speech
| Teknologi | Versi | Fungsi |
|---|---|---|
| **MapLibre GL JS** | 3.6.2 | Peta interaktif |
| **OpenStreetMap** | — | Raster tiles |
| **Web Speech API** | — | Text-to-Speech |

### Storage & Utilities
| Teknologi | Fungsi |
|---|---|
| **Supabase Storage** | Upload gambar |
| **Sonner** | Toast notifications |
| **date-fns** | Date formatting |
| **Lucide React** | Icons |

---

## 🚀 Quick Start

### Prasyarat
- **Node.js** 20+
- **npm** 10+
- **PostgreSQL** database (atau akun [Neon](https://neon.tech) gratis)

### Instalasi

```bash
# 1. Clone repo
git clone <repo-url>
cd peta-cerita

# 2. Install dependencies
npm install

# 3. Copy .env.example → .env
cp .env.example .env