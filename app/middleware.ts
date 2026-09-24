import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";


/**
 * Middleware PETA CERITA.
 * - Proteksi route yang butuh login
 * - Proteksi route admin (harus ADMIN atau MODERATOR)
 * - Redirect kalau sudah login tapi buka /login atau /register
 */

// Route yang butuh login
const PROTECTED_ROUTES = [
  "/profile",
  "/contribute",
  "/settings",
];

// Route yang hanya boleh diakses ADMIN/MODERATOR
const ADMIN_ROUTES = ["/admin"];

// Route yang hanya boleh diakses kalau BELUM login
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const userRole = req.auth?.user?.role;

  const pathname = nextUrl.pathname;

  // 1. Kalau sudah login dan buka /login atau /register → redirect ke /
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Route admin → harus login + role ADMIN/MODERATOR
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    return NextResponse.next();
  }

  // 3. Route yang butuh login → redirect ke /login kalau belum login
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Route lain → lewatkan
  return NextResponse.next();
});

/**
 * Matcher: hanya jalankan middleware di route yang relevan.
 * Skip: /api, /_next, /static, file statis
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*|icons|images).*)",
  ],
};