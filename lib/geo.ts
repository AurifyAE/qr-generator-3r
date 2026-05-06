import { UAParser } from "ua-parser-js";

export async function parseRequest(req: Request) {
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const ua = req.headers.get("user-agent") || "";
    const parser = new UAParser(ua);
    const device = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name || "unknown";
    const os = parser.getOS().name || "unknown";

    let country = "unknown";
    let city = "unknown";

    if (ip !== "unknown") {
        try {
            const res = await fetch(
                `http://ip-api.com/json/${ip}?fields=status,country,city`,
                { signal: AbortSignal.timeout(2000) }
            );
            if (res.ok) {
                const geo = await res.json();
                if (geo.status === "success") {
                    country = geo.country ?? "unknown";
                    city = geo.city ?? "unknown";
                }
            }
        } catch {
            // geo lookup failed — continue with unknowns
        }
    }

    return { ip, device, browser, os, country, city, ua };
}