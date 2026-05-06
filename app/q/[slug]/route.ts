import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QRCode from "@/models/QRCode";
import Scan from "@/models/Scan";
import { parseRequest } from "@/lib/geo";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    await connectDB();
    const { slug } = await params;

    const doc = await QRCode.findOne({ slug, active: true });
    if (!doc) {
        return new NextResponse("QR code not found", { status: 404 });
    }

    // log + increment — don't await, redirect immediately
    (async () => {
        try {
            const meta = await parseRequest(req);
            await Scan.create({ qrId: doc._id, ...meta });
            await QRCode.findByIdAndUpdate(doc._id, { $inc: { scanCount: 1 } });
        } catch (e) {
            console.error("Scan log failed:", e);
        }
    })();

    return NextResponse.redirect(doc.destinationUrl, 302);
}