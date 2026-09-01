
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

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

    const adminCookie =
      request.cookies.get("intentcart_admin_auth")?.value;

    if (adminCookie !== "true") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
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
    // FETCH ORDER FROM BACKEND
    // =====================================================

    const response = await fetch(
      `${BACKEND_URL}/api/orders/${encodeURIComponent(id)}`,
      {
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
        { status: response.status || 500 }
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
          "Unable to connect to the backend server.",
      },
      { status: 500 }
    );
  }
}
