
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://intentcart-pixx.onrender.com";

const ADMIN_API_SECRET =
  process.env.ADMIN_API_SECRET || "";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // =====================================================
    // ADMIN AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // CHECK ADMIN API SECRET
    // =====================================================

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

    // =====================================================
    // GET ORDER ID
    // =====================================================

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is missing.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // FETCH ORDER FROM PROTECTED BACKEND
    // =====================================================

    const response = await fetch(
      `${BACKEND_URL}/api/orders/${encodeURIComponent(id)}`,
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
      "ADMIN ORDER DETAILS:",
      data
    );

    // =====================================================
    // BACKEND ERROR
    // =====================================================

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            data.error ||
            "Unable to load order.",
        },
        {
          status: response.status || 500,
        }
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        order: data.order,
        items: Array.isArray(data.items)
          ? data.items
          : [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN ORDER DETAILS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the backend server.",
      },
      { status: 500 }
    );
  }
}
