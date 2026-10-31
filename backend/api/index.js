import mongoose from 'mongoose';
import app from '../src/app.js';

// Reuse the connection across serverless invocations (avoids re-connecting on every request)
let cached = global._campusMongoose;
if (!cached) {
  cached = global._campusMongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }

  return app(req, res);
}
