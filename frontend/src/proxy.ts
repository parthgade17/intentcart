import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔥 PROXY RUNNING:", pathname);

  // Protect the entire control center
  if (pathname.startsWith("/control-center/")) {
    const auth = request.cookies.get(
      "intentcart_admin_auth"
    )?.value;

    console.log("🔥 ADMIN AUTH:", auth ? "PRESENT" : "MISSING");

    if (auth !== "true") {
      console.log("🔥 REDIRECTING TO ADMIN LOGIN");

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