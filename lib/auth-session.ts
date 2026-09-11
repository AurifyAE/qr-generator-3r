import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "qr_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(value: string) {
    return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createAdminSession() {
    const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
    const payload = String(expiresAt);
    return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(value: string | undefined) {
    if (!value || !getSessionSecret()) return false;

    const [expiresAt, signature] = value.split(".");
    if (!expiresAt || !signature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
        return false;
    }

    const expected = sign(expiresAt);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    return (
        actualBuffer.length === expectedBuffer.length &&
        timingSafeEqual(actualBuffer, expectedBuffer)
    );
}

export function isValidAdminPassword(password: unknown) {
    const configuredPassword = process.env.ADMIN_PASSWORD || "";
    if (typeof password !== "string" || !configuredPassword) return false;

    const passwordBuffer = Buffer.from(password);
    const configuredBuffer = Buffer.from(configuredPassword);

    return (
        passwordBuffer.length === configuredBuffer.length &&
        timingSafeEqual(passwordBuffer, configuredBuffer)
    );
}
