
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all Control Center pages except the login page.
  if (
    pathname.startsWith("/control-center") &&
    pathname !== "/control-center"
  ) {
    const adminAuth = request.cookies.get(
      "intentcart_admin_auth"
    )?.value;

    if (adminAuth !== "true") {
      const loginUrl = new URL(
        "/control-center",
        request.url
      );

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control-center/:path*"],
};
