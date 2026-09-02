import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminAuth = request.cookies.get(
    "intentcart_admin_auth"
  )?.value;

  console.log("🔥 PROXY RUNNING:", pathname);
  console.log("🔐 ADMIN COOKIE:", adminAuth);

  // =====================================================
  // PROTECTED ADMIN AREA
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
  // ADMIN LOGIN PAGE
  // =====================================================

  if (pathname === "/control-center") {
    if (adminAuth === "true") {
      const dashboardUrl = request.nextUrl.clone();

      dashboardUrl.pathname =
        "/control-center/dashboard";

      dashboardUrl.search = "";

      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control-center", "/control-center/:path*"],
};