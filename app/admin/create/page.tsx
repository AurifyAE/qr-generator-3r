"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [result, setResult] = useState<any>(null);
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
        setResult(data);
        setLoading(false);
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: 480 }}>
            <h1 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Create QR Code</h1>

            <input
                placeholder="Label (e.g. Product Launch)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={inputStyle}
            />
            <input
                placeholder="Destination URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={inputStyle}
            />

            <button
                onClick={submit}
                disabled={loading}
                style={{ background: "#000", color: "#fff", border: "none", padding: "0.75rem 2rem", cursor: "pointer", fontSize: "1rem", width: "100%", marginTop: "0.5rem" }}
            >
                {loading ? "Generating..." : "Generate QR"}
            </button>

            {result && (
                <div style={{ marginTop: "2rem", textAlign: "center" }}>
                    <img src={result.qrImage} alt="QR Code" style={{ width: 250 }} />
                    <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#555" }}>
                        Scan URL: <code>{result.qrUrl}</code>
                    </p>
                    <a href={result.qrImage} download={`${result.slug}.png`}>
                        <button style={{ marginTop: "1rem", background: "#000", color: "#fff", border: "none", padding: "0.5rem 1.5rem", cursor: "pointer" }}>
                            Download PNG
                        </button>
                    </a>
                    <br />
                    <button onClick={() => router.push("/admin")} style={{ marginTop: "0.75rem", background: "none", border: "1px solid #000", padding: "0.5rem 1.5rem", cursor: "pointer" }}>
                        Back to Admin
                    </button>
                </div>
            )}
        </div>
    );
}

const inputStyle = {
    display: "block", width: "100%", padding: "0.75rem", marginBottom: "1rem",
    border: "1px solid #ccc", fontSize: "1rem", fontFamily: "monospace",
    boxSizing: "border-box" as const,
};