import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (cached?.conn) {
      return cached.conn;
    }

    cached!.promise = mongoose.connect(MONGODB_URI);
    cached!.conn = await cached!.promise;
    
    return cached!.conn;
  } catch (error) {
    cached!.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB; 