import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔥 PROXY RUNNING:", pathname);

  // Protect every page inside /control-center/
  // except the login page itself.
  if (
    pathname.startsWith("/control-center/") &&
    pathname !== "/control-center"
  ) {
    const auth = request.cookies.get(
      "intentcart_admin_auth"
    )?.value;

    console.log("🔥 ADMIN AUTH:", auth);

    if (auth !== "true") {
      console.log("🔥 NOT AUTHENTICATED — REDIRECTING");

      return NextResponse.redirect(
        new URL("/control-center", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control-center/:path*"],
};