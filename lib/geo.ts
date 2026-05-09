import { UAParser } from "ua-parser-js";

function isPrivateOrLocalIp(ip: string) {
    const normalized = ip.replace(/^::ffff:/, "").toLowerCase();
    if (
        normalized === "127.0.0.1" ||
        normalized === "::1" ||
        normalized === "localhost"
    ) {
        return true;
    }
    if (
        normalized.startsWith("10.") ||
        normalized.startsWith("192.168.") ||
        normalized.startsWith("169.254.")
    ) {
        return true;
    }
    if (normalized.startsWith("172.")) {
        const second = Number(normalized.split(".")[1]);
        if (second >= 16 && second <= 31) return true;
    }
    if (
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe80:")
    ) {
        return true;
    }
    return false;
}

function pickClientIp(req: Request) {
    const headerCandidates = [
        req.headers.get("cf-connecting-ip"),
        req.headers.get("x-real-ip"),
        req.headers.get("x-vercel-forwarded-for"),
        req.headers.get("x-forwarded-for"),
    ].filter(Boolean) as string[];

    const ips = headerCandidates
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean);

    const publicIp = ips.find((candidate) => !isPrivateOrLocalIp(candidate));
    return publicIp || ips[0] || "unknown";
}

export async function parseRequest(req: Request) {
    const ip = pickClientIp(req);

    const ua = req.headers.get("user-agent") || "";
    const parser = new UAParser(ua);
    const device = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name || "unknown";
    const os = parser.getOS().name || "unknown";

    let country = "Unknown";
    let city = "Unknown";

    if (ip !== "unknown") {
        try {
            const res = await fetch(
                `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,city`,
                { signal: AbortSignal.timeout(2000) }
            );
            if (res.ok) {
                const geo = await res.json();
                if (geo.success) {
                    country = geo.country ?? "Unknown";
                    city = geo.city ?? "Unknown";
                }
            }
        } catch {
            // geo lookup failed - continue with Unknown
        }
    }

    return { ip, device, browser, os, country, city, ua };
}