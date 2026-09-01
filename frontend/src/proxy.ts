import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
const { pathname } = request.nextUrl;

const adminAuth =
request.cookies.get("intentcart_admin_auth")?.value;

console.log("🔥 PROXY RUNNING:", pathname);
console.log("🔐 ADMIN COOKIE:", adminAuth);

// Protect the entire Control Center
if (
pathname.startsWith("/control-center") &&
adminAuth !== "true"
) {
const loginUrl = request.nextUrl.clone();

loginUrl.pathname = "/admin";
loginUrl.search = "";

return NextResponse.redirect(loginUrl);

}

// If already logged in, don't show the admin login page
if (
pathname === "/admin" &&
adminAuth === "true"
) {
const dashboardUrl = request.nextUrl.clone();

dashboardUrl.pathname =
  "/control-center/dashboard";

dashboardUrl.search = "";

return NextResponse.redirect(dashboardUrl);

}

return NextResponse.next();
}

export const config = {
matcher: [
"/admin",
"/control-center/:path*",
],
};

