import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/features/auth/jwt";

const ADMIN_PUBLIC = ["/admin/login"];
const USER_PROTECTED = ["/journey", "/account"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  // Admin namespace: separate guard, separate login.
  if (pathname.startsWith("/admin")) {
    const isAdminLogin = ADMIN_PUBLIC.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (isAdminLogin) {
      if (session?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin-only API.
  if (pathname.startsWith("/api/admin")) {
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // User-protected pages.
  const isProtected = USER_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Already-authed users shouldn't hit /login or /register.
  if (session && session.role === "user" && (pathname === "/login")) {
    return NextResponse.redirect(new URL("/journey", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/journey/:path*",
    "/account/:path*",
    "/login",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
