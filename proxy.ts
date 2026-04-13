import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/")) {
    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf-8")
      );
      if (
        pathname.startsWith("/api/admin/audit/") &&
        payload.scope !== "audit:write"
      ) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    }
  }

  const protectedPaths = ["/profile", "/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const authPaths = ["/login", "/register", "/verify"];
  const isAuthPage = authPaths.some((p) => pathname === p);

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/verify",
    "/api/admin/:path*",
  ],
};
