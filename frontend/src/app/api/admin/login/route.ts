import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || "";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (
      username !== ADMIN_USERNAME ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin username or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set(
      "intentcart_admin_auth",
      "true",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      }
    );

    return response;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Invalid login request.",
      },
      { status: 400 }
    );
  }
}