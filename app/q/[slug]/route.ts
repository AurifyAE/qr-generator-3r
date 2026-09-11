import { after } from "next/server";
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

    // Keep the redirect fast, but register the work with Next.js so a
    // serverless invocation remains alive until the analytics work finishes.
    after(async () => {
        const countPromise = QRCode.findByIdAndUpdate(doc._id, { $inc: { scanCount: 1 } })
            .catch((e) => console.error("Scan count update failed:", e));

        try {
            const meta = await parseRequest(req);
            await Scan.create({ qrId: doc._id, ...meta });
        } catch (e) {
            console.error("Scan log failed:", e);
        }

        await countPromise;
    });

    const destination = /^https?:\/\//i.test(doc.destinationUrl)
        ? doc.destinationUrl
        : `https://${doc.destinationUrl}`;

    return NextResponse.redirect(destination, {
        status: 302,
        headers: { "Cache-Control": "no-store, max-age=0" },
    });
}
