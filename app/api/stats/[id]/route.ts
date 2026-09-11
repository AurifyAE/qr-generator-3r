import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Scan from "@/models/Scan";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid QR code id" }, { status: 400 });
    }

    const qrId = new mongoose.Types.ObjectId(id);
    const match = { $match: { qrId } };

    const [scans, total, dailyRows, deviceRows, countryRows] = await Promise.all([
        // The table only displays 50 rows, so do not send hundreds of rows to the browser.
        Scan.find({ qrId }).sort({ timestamp: -1 }).limit(50).lean(),
        Scan.countDocuments({ qrId }),
        Scan.aggregate([
            match,
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$timestamp",
                            timezone: "UTC",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Scan.aggregate([
            match,
            { $group: { _id: { $ifNull: ["$device", "Unknown"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Scan.aggregate([
            match,
            { $group: { _id: { $ifNull: ["$country", "Unknown"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
    ]);

    const daily = Object.fromEntries(dailyRows.map((row) => [row._id, row.count]));
    const byDevice = Object.fromEntries(deviceRows.map((row) => [row._id, row.count]));
    const byCountry = Object.fromEntries(countryRows.map((row) => [row._id, row.count]));

    return NextResponse.json({ scans, total, daily, byDevice, byCountry });
}
