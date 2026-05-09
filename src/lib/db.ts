import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongoose {
  mongoose?: MongooseCache;
}

const cached = (globalThis as unknown as GlobalWithMongoose).mongoose ?? { conn: null, promise: null };
(globalThis as unknown as GlobalWithMongoose).mongoose = cached;

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose)
      .catch((err) => {
        cached!.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
