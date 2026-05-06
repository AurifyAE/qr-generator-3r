import mongoose, { Schema, Document } from "mongoose";

export interface IScan extends Document {
    qrId: mongoose.Types.ObjectId;
    timestamp: Date;
    ip: string;
    ua: string;
    device: string;
    browser: string;
    os: string;
    country: string;
    city: string;
}

const ScanSchema = new Schema<IScan>({
    qrId: { type: Schema.Types.ObjectId, ref: "QRCode", required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    ip: String,
    ua: String,
    device: String,
    browser: String,
    os: String,
    country: String,
    city: String,
});

export default mongoose.models.Scan ||
    mongoose.model<IScan>("Scan", ScanSchema);