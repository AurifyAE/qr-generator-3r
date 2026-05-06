import mongoose, { Schema, Document } from "mongoose";

export interface IQRCode extends Document {
    slug: string;
    label: string;
    destinationUrl: string;
    active: boolean;
    scanCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
    {
        slug: { type: String, required: true, unique: true, index: true },
        label: { type: String, required: true },
        destinationUrl: { type: String, required: true },
        active: { type: Boolean, default: true },
        scanCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.QRCode ||
    mongoose.model<IQRCode>("QRCode", QRCodeSchema);