"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setError(data.error || "Unable to sign in");
                return;
            }

            window.location.assign("/admin");
        } catch {
            setError("Unable to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-slate-100 p-6">
                <h1 className="text-lg font-medium text-slate-900">Admin sign in</h1>
                <p className="mt-1 mb-6 text-[13px] text-slate-400">Enter your admin password to continue.</p>
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    autoFocus
                    required
                    className="block w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                />
                {error && <p className="mt-2 text-[12px] text-rose-600">{error}</p>}
                <button
                    type="submit"
                    disabled={loading || !password}
                    className="mt-4 w-full py-2.5 rounded-lg bg-slate-900 text-white text-[13px] font-medium disabled:opacity-40"
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </main>
    );
}
