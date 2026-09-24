import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Toaster } from "sonner";

import { SessionProvider } from "@/components/layout/SessionProvider";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/lib/constants";


import "./globals.css";

// ============================================
// FONTS
// ============================================
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  variable: "--font-serif",
});

// ============================================
// METADATA (SEO)
// ============================================
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Peta Cerita, Sejarah & Budaya Indonesia`,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "peta cerita",
    "sejarah indonesia",
    "budaya indonesia",
    "legenda",
    "cerita rakyat",
    "edukasi",
    "peta interaktif",
    "wisata edukasi",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  applicationName: APP_NAME,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Peta Cerita, Sejarah & Budaya Indonesia`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Peta Cerita, Sejarah & Budaya Indonesia`,
    description: APP_DESCRIPTION,
    images: ["/images/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

// ============================================
// VIEWPORT
// ============================================
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f9d69" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ============================================
// ROOT LAYOUT
// ============================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                }}
              />
                </QueryProvider>
            </SessionProvider>
          </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}