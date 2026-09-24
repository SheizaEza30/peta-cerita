"use client";

import { useEffect } from "react";

/**
 * Register service worker untuk PWA.
 * Hanya aktif di production, agar tidak mengganggu HMR di development.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Hanya di production — dev pakai HMR Next.js
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.warn("[PWA] Service Worker registered:", registration.scope);
      })
      .catch((err) => {
        console.error("[PWA] Service Worker registration failed:", err);
      });
  }, []);

  return null;
}