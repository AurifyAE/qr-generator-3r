import { NextRequest, NextResponse } from "next/server";
import {
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_TTL_SECONDS,
    createAdminSession,
    isValidAdminPassword,
} from "@/lib/auth-session";

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const password =
        typeof body === "object" && body !== null && "password" in body
            ? (body as { password?: unknown }).password
            : undefined;

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
        return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
    }

    if (!isValidAdminPassword(password)) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: ADMIN_SESSION_COOKIE,
        value: createAdminSession(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: ADMIN_SESSION_TTL_SECONDS,
    });

    return response;
}
