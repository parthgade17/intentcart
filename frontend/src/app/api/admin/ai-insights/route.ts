
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://intentcart-pixx.onrender.com";

const ADMIN_API_SECRET =
  process.env.ADMIN_API_SECRET || "";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication cookie
    const adminAuth = request.cookies.get(
      "intentcart_admin_auth"
    )?.value;

    if (adminAuth !== "true") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Check backend secret
    if (!ADMIN_API_SECRET) {
      console.error(
        "ADMIN_API_SECRET is missing from frontend environment variables."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Admin API configuration is missing.",
        },
        { status: 500 }
      );
    }

    // Call protected Render backend
    const response = await fetch(
      `${BACKEND_URL}/api/ai-insights`,
      {
        method: "GET",
        headers: {
          "x-admin-api-secret": ADMIN_API_SECRET,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log(
      "ADMIN AI INSIGHTS RESPONSE:",
      data
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "ADMIN AI INSIGHTS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load AI insights.",
      },
      { status: 500 }
    );
  }
}

