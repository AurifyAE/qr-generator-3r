"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StatsPage() {
    const { id } = useParams();
    const [qr, setQr] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [newUrl, setNewUrl] = useState("");

    useEffect(() => {
        fetch(`/api/qr/${id}`).then((r) => r.json()).then((d) => { setQr(d); setNewUrl(d.destinationUrl); });
        fetch(`/api/stats/${id}`).then((r) => r.json()).then(setStats);
    }, [id]);

    const saveUrl = async () => {
        await fetch(`/api/qr/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destinationUrl: newUrl }),
        });
        setQr((p: any) => ({ ...p, destinationUrl: newUrl }));
        setEditing(false);
    };

    if (!qr || !stats) return <div style={{ padding: "2rem" }}>Loading…</div>;

    const dailyData = Object.entries(stats.daily)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: date.slice(5), count }));

    return (
        <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: 800 }}>
            <h1 style={{ fontSize: "1.4rem" }}>{qr.label}</h1>
            <p style={{ color: "#555" }}>Slug: <code>/q/{qr.slug}</code> · Total scans: <strong>{qr.scanCount}</strong></p>

            {/* QR Image */}
            <img src={qr.qrImage} alt="QR" style={{ width: 180, margin: "1rem 0" }} />

            {/* Edit destination */}
            <div style={{ marginBottom: "1.5rem" }}>
                {editing ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                            style={{ flex: 1, padding: "0.5rem", fontFamily: "monospace" }} />
                        <button onClick={saveUrl} style={btn("#000")}>Save</button>
                        <button onClick={() => setEditing(false)} style={btn("#888")}>Cancel</button>
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem", color: "#333" }}>{qr.destinationUrl}</span>
                        <button onClick={() => setEditing(true)} style={btn("#444", "0.75rem")}>Edit URL</button>
                    </div>
                )}
            </div>

            {/* Daily chart */}
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Daily Scans</h2>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#000" />
                </BarChart>
            </ResponsiveContainer>

            {/* Device + Country */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1.5rem" }}>
                <div>
                    <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>By Device</h3>
                    {Object.entries(stats.byDevice).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{k}</span><strong>{v as number}</strong>
                        </div>
                    ))}
                </div>
                <div>
                    <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>By Country</h3>
                    {Object.entries(stats.byCountry).slice(0, 8).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{k}</span><strong>{v as number}</strong>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent scans */}
            <h2 style={{ fontSize: "1rem", marginTop: "2rem", marginBottom: "0.5rem" }}>Recent Scans</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid #000" }}>
                        {["Time", "IP", "Device", "Country", "City"].map((h) => (
                            <th key={h} style={{ textAlign: "left", padding: "0.4rem" }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {stats.scans.slice(0, 50).map((s: any) => (
                        <tr key={s._id} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "0.4rem" }}>{new Date(s.timestamp).toLocaleString()}</td>
                            <td style={{ padding: "0.4rem" }}>{s.ip}</td>
                            <td style={{ padding: "0.4rem" }}>{s.device}</td>
                            <td style={{ padding: "0.4rem" }}>{s.country}</td>
                            <td style={{ padding: "0.4rem" }}>{s.city}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const btn = (bg: string, fontSize = "0.85rem") => ({
    background: bg, color: "#fff", border: "none",
    padding: "0.4rem 0.8rem", cursor: "pointer", fontSize,
});