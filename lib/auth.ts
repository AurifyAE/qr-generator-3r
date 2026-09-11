import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/auth-session";

export async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
