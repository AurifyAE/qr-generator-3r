"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
    const [codes, setCodes] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/qr")
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setCodes(data); })
            .catch((err) => console.error("Failed to load QR codes:", err));
    }, []);

    const toggle = async (id: string, active: boolean) => {
        await fetch(`/api/qr/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !active }),
        });
        setCodes((prev) =>
            prev.map((c) => (c._id === id ? { ...c, active: !active } : c))
        );
    };

    const remove = async (id: string) => {
        const confirmed = window.confirm("Delete this QR code permanently?");
        if (!confirmed) return;
        const res = await fetch(`/api/qr/${id}`, { method: "DELETE" });
        if (!res.ok) {
            window.alert("Failed to delete QR code.");
            return;
        }
        setCodes((prev) => prev.filter((c) => c._id !== id));
    };

    const filteredCodes = codes.filter((c) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
            c.label?.toLowerCase().includes(query) ||
            c.slug?.toLowerCase().includes(query) ||
            c.destinationUrl?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="px-6 py-8 font-sans text-slate-900">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-lg font-medium">QR codes</h1>
                <Link href="/admin/create">
                    <button className="text-[13px] font-medium px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                        + New QR
                    </button>
                </Link>
            </div>

            <div className="mb-5">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by label, slug, or destination URL"
                    className="w-full max-w-md px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:border-slate-400"
                />
            </div>

            <table className="w-full border-collapse text-[13px]" style={{ tableLayout: "fixed" }}>
                <colgroup>
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "28%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "21%" }} />
                </colgroup>
                <thead>
                    <tr className="border-b border-slate-100">
                        {["Label", "Slug", "Destination", "Scans", "Status", "Actions"].map((h) => (
                            <th key={h} className="text-left px-3 pb-2.5 text-[11px] font-medium text-slate-400 tracking-wider uppercase">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredCodes.map((c) => (
                        <tr key={c._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-3.5 font-medium truncate">{c.label}</td>
                            <td className="px-3 py-3.5 font-mono text-[12px] text-slate-500 truncate">{c.slug}</td>
                            <td className="px-3 py-3.5 text-[12px] text-slate-500 truncate">{c.destinationUrl}</td>
                            <td className="px-3 py-3.5 font-medium tabular-nums">{c.scanCount.toLocaleString()}</td>
                            <td className="px-3 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.active
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                                    {c.active ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-3 py-3.5">
                                <div className="flex gap-1.5">
                                    <Link href={`/admin/${c._id}`}>
                                        <button className="text-[12px] font-medium px-3 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                                            Stats
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => toggle(c._id, c.active)}
                                        className={`text-[12px] font-medium px-3 py-1 rounded-md transition-opacity hover:opacity-80 ${c.active
                                                ? "bg-rose-50 text-rose-700"
                                                : "bg-emerald-50 text-emerald-700"
                                            }`}
                                    >
                                        {c.active ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                        onClick={() => remove(c._id)}
                                        className="text-[12px] font-medium px-3 py-1 rounded-md border border-rose-100 bg-rose-50 text-rose-700 hover:opacity-80 transition-opacity"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredCodes.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-3 py-8 text-center text-[13px] text-slate-400">
                                No QR codes found for this search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}