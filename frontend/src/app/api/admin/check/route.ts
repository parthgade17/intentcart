import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
const authCookie = request.cookies.get(
"intentcart_admin_auth"
);

if (authCookie?.value !== "true") {
return NextResponse.json(
{
success: false,
authenticated: false,
},
{ status: 401 }
);
}

return NextResponse.json({
success: true,
authenticated: true,
});
}
