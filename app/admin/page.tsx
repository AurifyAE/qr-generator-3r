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
        <div style={{ padding: "2rem", fontFamily: "monospace" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>QR Codes</h1>
                <Link href="/admin/create">
                    <button style={btnStyle("#000")}>+ New QR</button>
                </Link>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid #000" }}>
                        {["Label", "Slug", "Destination", "Scans", "Status", "Actions"].map((h) => (
                            <th key={h} style={{ textAlign: "left", padding: "0.5rem" }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {codes.map((c) => (
                        <tr key={c._id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "0.75rem" }}>{c.label}</td>
                            <td style={{ padding: "0.75rem", color: "#555" }}>{c.slug}</td>
                            <td style={{ padding: "0.75rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                                {c.destinationUrl}
                            </td>
                            <td style={{ padding: "0.75rem", fontWeight: 700 }}>{c.scanCount}</td>
                            <td style={{ padding: "0.75rem" }}>
                                <span style={{ color: c.active ? "green" : "red" }}>
                                    {c.active ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem" }}>
                                <Link href={`/admin/${c._id}`}>
                                    <button style={btnStyle("#444", "0.7rem")}>Stats</button>
                                </Link>
                                <button
                                    onClick={() => toggle(c._id, c.active)}
                                    style={btnStyle(c.active ? "#c00" : "#090", "0.7rem")}
                                >
                                    {c.active ? "Disable" : "Enable"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const btnStyle = (bg: string, fontSize = "0.9rem") => ({
    background: bg,
    color: "#fff",
    border: "none",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
    fontSize,
    borderRadius: 4,
});