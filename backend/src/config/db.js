import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi_store_db';
    const conn = await mongoose.connect(connStr);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    process.exit(1);
  }
};
