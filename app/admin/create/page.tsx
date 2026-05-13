"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

type CreateQRResult = {
    label: string;
    slug: string;
    qrImage: string;
    qrUrl: string;
};

export default function CreatePage() {
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [result, setResult] = useState<CreateQRResult | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const submit = async () => {
        if (!label || !url) return;
        setLoading(true);
        const res = await fetch("/api/qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, destinationUrl: url }),
        });
        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Failed to create QR code.");
            setLoading(false);
            return;
        }

        setResult(data);
        setLoading(false);
        toast.success("QR code created successfully!");
    };

    const downloadPNG = () => {
        if (!result) return;
        const a = document.createElement("a");
        a.href = result.qrImage;
        a.download = `${result.slug}.png`;
        a.click();
        toast.success("PNG downloaded successfully!");
    };

    const downloadSVG = async () => {
        if (!result) return;
        const svg = await QRCode.toString(result.qrUrl, { type: "svg", width: 320, margin: 2 });
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${result.slug}.svg`;
        a.click();
        URL.revokeObjectURL(href);
        toast.success("SVG downloaded successfully!");
    };

    const downloadPDF = () => {
        if (!result) return;
        const pdf = new jsPDF({ unit: "mm", format: "a4" });

        // Full-width QR image, actual square aspect ratio, centered vertically
        const size = 210;
        const y = (297 - size) / 2;
        pdf.addImage(result.qrImage, "PNG", 0, y, size, size);

        pdf.save(`${result.slug}.pdf`);
        toast.success("PDF downloaded successfully!");
    };

    return (
        <div className="min-h-screen flex items-start justify-center px-6 py-12">
            <div className="w-full max-w-sm">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/admin")}
                        className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors mb-5 flex items-center gap-1"
                    >
                        ← Back
                    </button>
                    <h1 className="text-lg font-medium text-gray-900">New QR code</h1>
                    <p className="text-[13px] text-gray-400 mt-1">Generate a trackable redirect link</p>
                </div>

                {!result ? (
                    /* Form */
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                                Label
                            </label>
                            <input
                                placeholder="e.g. Product Launch"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="block w-full px-3 py-2.5 text-[13px] rounded-lg border border-gray-200 bg-white placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                                Destination URL
                            </label>
                            <input
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && submit()}
                                className="block w-full px-3 py-2.5 text-[13px] rounded-lg border border-gray-200 bg-white placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors font-mono"
                            />
                        </div>

                        <button
                            onClick={submit}
                            disabled={loading || !label || !url}
                            className="mt-2 w-full py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
                        >
                            {loading ? "Generating…" : "Generate QR"}
                        </button>
                    </div>
                ) : (
                    /* Result */
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-xl border border-gray-100 p-5 bg-white">
                            <img src={result.qrImage} alt="QR Code" className="w-52 h-52" />
                        </div>

                        <div className="w-full rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Scan URL</p>
                            <code className="text-[12px] text-gray-700 break-all">{result.qrUrl}</code>
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-1">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={downloadPNG}
                                    className="w-full py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    PNG
                                </button>
                                <button
                                    onClick={downloadSVG}
                                    className="w-full py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    SVG
                                </button>
                                <button
                                    onClick={downloadPDF}
                                    className="w-full py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    PDF
                                </button>
                            </div>
                            <button
                                onClick={() => router.push("/admin")}
                                className="w-full py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Back to admin
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}