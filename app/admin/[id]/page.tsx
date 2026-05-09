"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function StatsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [qr, setQr] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/qr/${id}`)
            .then((r) => r.json())
            .then((d) => { setQr(d); setNewUrl(d.destinationUrl); });
        fetch(`/api/stats/${id}`)
            .then((r) => r.json())
            .then(setStats);
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

    const copy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/q/${qr.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const downloadPNG = () => {
        const a = document.createElement("a");
        a.href = qr.qrImage;
        a.download = `${qr.slug}.png`;
        a.click();
    };

    const downloadSVG = async () => {
        const svg = await QRCode.toString(qrUrl, { type: "svg", width: 320, margin: 2 });
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${qr.slug}.svg`;
        a.click();
        URL.revokeObjectURL(href);
    };

    const downloadPDF = () => {
        const scanUrl = `${window.location.origin}/q/${qr.slug}`;
        const pdf = new jsPDF({ unit: "mm", format: "a4" });

        // Page background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, 0, 210, 297, "F");

        // Title + subtitle
        pdf.setTextColor(15, 23, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.text("QR Code Card", 20, 24);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(11);
        pdf.text("Scan to open the destination instantly", 20, 31);

        // Header accent bar
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(20, 38, 170, 6, 2, 2, "F");

        // Main card
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(20, 50, 170, 175, 4, 4, "FD");

        // QR image
        pdf.addImage(qr.qrImage, "PNG", 35, 66, 60, 60);

        // Label and slug
        pdf.setTextColor(15, 23, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text(qr.label || "Untitled QR", 105, 77);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`/${qr.slug}`, 105, 84);

        // Destination block
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(35, 138, 140, 38, 3, 3, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(51, 65, 85);
        pdf.setFontSize(10);
        pdf.text("Scan URL", 41, 148);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(9);
        const wrappedScanUrl = pdf.splitTextToSize(scanUrl, 130);
        pdf.text(wrappedScanUrl, 41, 156);

        // Footer meta
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 245);
        pdf.text("Powered by 3R QR", 190, 245, { align: "right" });

        pdf.save(`${qr.slug}.pdf`);
    };

    if (!qr || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                    <span className="text-[13px] text-slate-400">Loading…</span>
                </div>
            </div>
        );
    }

    const qrUrl = `${window.location.origin}/q/${qr.slug}`;

    const dailyData = Object.entries(stats.daily)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: date.slice(5), count }));

    const maxCount = Math.max(...dailyData.map((d) => d.count as number));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="bg-slate-900 text-white text-[12px] px-2.5 py-1.5 rounded-lg">
                    <span className="text-slate-400 mr-2">{label}</span>
                    <span className="font-medium">{payload[0].value} scans</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto text-slate-900">

            {/* Back */}
            <button
                onClick={() => router.push("/admin")}
                className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mb-7"
            >
                ← Back
            </button>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-lg font-medium">{qr.label}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <code className="text-[12px] text-slate-500 font-mono">/q/{qr.slug}</code>
                        <button
                            onClick={copy}
                            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <img
                        src={qr.qrImage}
                        alt="QR Code"
                        className="w-16 h-16 rounded-lg border border-slate-100"
                    />
                    <div className="flex gap-1.5">
                        <button onClick={downloadPNG} className="px-2.5 py-1 text-[11px] rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                            PNG
                        </button>
                        <button onClick={downloadSVG} className="px-2.5 py-1 text-[11px] rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                            SVG
                        </button>
                        <button onClick={downloadPDF} className="px-2.5 py-1 text-[11px] rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-7">
                {[
                    { label: "Total scans", value: qr.scanCount.toLocaleString() },
                    { label: "Devices", value: Object.keys(stats.byDevice).length },
                    { label: "Countries", value: Object.keys(stats.byCountry).length },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1">{label}</p>
                        <p className="text-2xl font-medium">{value}</p>
                    </div>
                ))}
            </div>

            {/* Destination URL */}
            <div className="mb-7 rounded-lg border border-slate-100 px-4 py-3">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Destination URL</p>
                {editing ? (
                    <div className="flex gap-2">
                        <input
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveUrl()}
                            autoFocus
                            className="flex-1 px-3 py-2 text-[13px] font-mono rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors"
                        />
                        <button
                            onClick={saveUrl}
                            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-700 transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => { setEditing(false); setNewUrl(qr.destinationUrl); }}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] text-slate-700 font-mono truncate">{qr.destinationUrl}</span>
                        <button
                            onClick={() => setEditing(true)}
                            className="shrink-0 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="mb-7">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-4">Daily scans</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyData} barSize={16}>
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                            width={28}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {dailyData.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.count === maxCount ? "#0f172a" : "#e2e8f0"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Device + Country */}
            <div className="grid grid-cols-2 gap-4 mb-7">
                {[
                    { title: "By device", data: stats.byDevice },
                    { title: "By country", data: Object.fromEntries(Object.entries(stats.byCountry).slice(0, 8)) },
                ].map(({ title, data }) => {
                    const total = Object.values(data).reduce((s: any, v: any) => s + (v as number), 0) as number;
                    return (
                        <div key={title} className="rounded-lg border border-slate-100 px-4 py-3">
                            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-3">{title}</p>
                            <div className="flex flex-col gap-2.5">
                                {Object.entries(data).map(([k, v]) => {
                                    const pct = Math.round(((v as number) / total) * 100);
                                    return (
                                        <div key={k}>
                                            <div className="flex justify-between text-[12px] mb-1">
                                                <span className="text-slate-700">{k}</span>
                                                <span className="text-slate-400 font-medium tabular-nums">{v as number}</span>
                                            </div>
                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent scans */}
            <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-4">Recent scans</p>
                <table className="w-full border-collapse text-[12px]" style={{ tableLayout: "fixed" }}>
                    <colgroup>
                        <col style={{ width: "22%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "32%" }} />
                    </colgroup>
                    <thead>
                        <tr className="border-b border-slate-100">
                            {["Time", "IP", "Device", "Country", "City"].map((h) => (
                                <th key={h} className="text-left pb-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {stats.scans.slice(0, 50).map((s: any) => (
                            <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 text-slate-500 font-mono truncate">
                                    {new Date(s.timestamp).toLocaleString(undefined, {
                                        month: "short", day: "numeric",
                                        hour: "2-digit", minute: "2-digit",
                                    })}
                                </td>
                                <td className="py-2.5 text-slate-500 font-mono truncate">{s.ip}</td>
                                <td className="py-2.5 text-slate-700 truncate">{s.device}</td>
                                <td className="py-2.5 text-slate-700 truncate">{s.country}</td>
                                <td className="py-2.5 text-slate-700 truncate">{s.city}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}