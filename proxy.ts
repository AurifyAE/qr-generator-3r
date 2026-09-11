import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/auth-session";

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
    const isProtectedApi =
        pathname.startsWith("/api/qr") || pathname.startsWith("/api/stats/");

    if (!isAdminPage && !isProtectedApi) return NextResponse.next();

    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (isValidAdminSession(session)) return NextResponse.next();

    if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
    matcher: ["/admin", "/admin/:path*", "/api/qr/:path*", "/api/stats/:path*"],
};
