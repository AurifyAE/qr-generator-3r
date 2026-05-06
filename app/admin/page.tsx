"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
    const [codes, setCodes] = useState<any[]>([]);

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

    return (
        <div className="px-6 py-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-lg font-medium text-gray-900">QR codes</h1>
                <Link href="/admin/create">
                    <button className="text-[13px] font-medium px-3.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                        + New QR
                    </button>
                </Link>
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
                    <tr className="border-b border-gray-100">
                        {["Label", "Slug", "Destination", "Scans", "Status", "Actions"].map((h) => (
                            <th key={h} className="text-left px-3 pb-2.5 text-[11px] font-medium text-gray-400 tracking-wider uppercase">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {codes.map((c) => (
                        <tr key={c._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-3.5 font-medium truncate">{c.label}</td>
                            <td className="px-3 py-3.5 font-mono text-[12px] text-gray-500 truncate">{c.slug}</td>
                            <td className="px-3 py-3.5 text-[12px] text-gray-500 truncate">{c.destinationUrl}</td>
                            <td className="px-3 py-3.5 font-medium tabular-nums">{c.scanCount.toLocaleString()}</td>
                            <td className="px-3 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.active
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.active ? "bg-green-500" : "bg-gray-400"}`} />
                                    {c.active ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-3 py-3.5">
                                <div className="flex gap-1.5">
                                    <Link href={`/admin/${c._id}`}>
                                        <button className="text-[12px] font-medium px-3 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                            Stats
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => toggle(c._id, c.active)}
                                        className={`text-[12px] font-medium px-3 py-1 rounded-md transition-opacity hover:opacity-80 ${c.active
                                                ? "bg-red-50 text-red-700"
                                                : "bg-green-50 text-green-700"
                                            }`}
                                    >
                                        {c.active ? "Disable" : "Enable"}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}