import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Scan from "@/models/Scan";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;

    const scans = await Scan.find({ qrId: id })
        .sort({ timestamp: -1 })
        .limit(500);

    // daily aggregation
    const daily: Record<string, number> = {};
    for (const s of scans) {
        const day = s.timestamp.toISOString().slice(0, 10);
        daily[day] = (daily[day] || 0) + 1;
    }

    const byDevice: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    for (const s of scans) {
        byDevice[s.device] = (byDevice[s.device] || 0) + 1;
        byCountry[s.country] = (byCountry[s.country] || 0) + 1;
    }

    return NextResponse.json({ scans, daily, byDevice, byCountry });
}