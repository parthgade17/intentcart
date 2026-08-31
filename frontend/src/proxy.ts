
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all admin pages except the login page.
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const adminAuth = request.cookies.get(
      "intentcart_admin_auth"
    )?.value;

    if (adminAuth !== "true") {
      const loginUrl = new URL("/admin", request.url);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

