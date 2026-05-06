import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QRCode from "@/models/QRCode";
import { generateQRDataURL } from "@/lib/qrgen";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const doc = await QRCode.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/q/${doc.slug}`;
    const qrImage = await generateQRDataURL(qrUrl);
    return NextResponse.json({ ...doc.toObject(), qrImage, qrUrl });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const doc = await QRCode.findByIdAndUpdate(id, body, { new: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    await QRCode.findByIdAndUpdate(id, { active: false });
    return NextResponse.json({ success: true });
}