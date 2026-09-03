
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminAuth = request.cookies.get(
    "intentcart_admin_auth"
  )?.value;

  console.log("🔥 PROXY RUNNING:", pathname);
  console.log("🔐 ADMIN COOKIE:", adminAuth);

  // =====================================================
  // ADMIN LOGIN PAGE
  // =====================================================
  // Always allow /control-center to show the login page.
  // We do NOT redirect authenticated users automatically.
  // =====================================================

  if (pathname === "/control-center") {
    return NextResponse.next();
  }

  // =====================================================
  // PROTECTED ADMIN PAGES
  // =====================================================

  if (pathname.startsWith("/control-center/")) {
    if (adminAuth !== "true") {
      const loginUrl = request.nextUrl.clone();

      loginUrl.pathname = "/control-center";
      loginUrl.search = "";

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // =====================================================
  // EVERYTHING ELSE
  // =====================================================

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/control-center",
    "/control-center/:path*",
  ],
};
