import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((m) => m).catch((err) => {
            cached.promise = null; // allow retry on next request
            throw err;
        });
    }
    cached.conn = await cached.promise;
    (global as any).mongoose = cached;
    return cached.conn;
}