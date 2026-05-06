import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { generateQRDataURL } from "@/lib/qrgen";
import QRCode from "@/models/QRCode";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        await connectDB();
        const codes = await QRCode.find().sort({ createdAt: -1 });
        return NextResponse.json(codes);
    } catch (err) {
        console.error("GET /api/qr error:", err);
        return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { label, destinationUrl } = await req.json();

        if (!label || !destinationUrl)
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const slug = nanoid(7);
        const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/q/${slug}`;
        const qrImage = await generateQRDataURL(qrUrl);

        const doc = await QRCode.create({ slug, label, destinationUrl });

        return NextResponse.json({ ...doc.toObject(), qrImage, qrUrl }, { status: 201 });
    } catch (err) {
        console.error("POST /api/qr error:", err);
        return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
    }
}