import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminAuth = request.cookies.get(
    "intentcart_admin_auth"
  )?.value;

  console.log("🔥 PROXY RUNNING:", pathname);
  console.log("🔐 ADMIN COOKIE:", adminAuth);

  // Protect dashboard, transactions, and AI insights
  if (
    pathname.startsWith("/control-center/dashboard") ||
    pathname.startsWith("/control-center/transactions") ||
    pathname.startsWith("/control-center/ai-insights")
  ) {
    if (adminAuth !== "true") {
      const loginUrl = request.nextUrl.clone();

      loginUrl.pathname = "/control-center";
      loginUrl.search = "";

      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting the login page,
  // send the admin directly to the dashboard.
  if (
    pathname === "/control-center" &&
    adminAuth === "true"
  ) {
    const dashboardUrl = request.nextUrl.clone();

    dashboardUrl.pathname = "/control-center/dashboard";
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/control-center",
    "/control-center/dashboard/:path*",
    "/control-center/transactions/:path*",
    "/control-center/ai-insights/:path*",
  ],
};