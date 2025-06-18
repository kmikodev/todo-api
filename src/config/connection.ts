
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const dbType = process.env.TODO_API_DB || 'memory';
  
  if (dbType === 'mongoose') {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasks';
      await mongoose.connect(mongoUri);
      console.log('🍃 MongoDB connected successfully via Mongoose');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  } else if (dbType === 'prisma') {
    console.log('🔹 Using Prisma - connection will be managed by PrismaClient');
  } else {
    console.log('💾 Using in-memory storage');
  }
};

export const disconnectDB = async (): Promise<void> => {
  const dbType = process.env.TODO_API_DB || 'memory';
  
  if (dbType === 'mongoose') {
    try {
      await mongoose.disconnect();
      console.log('🍃 MongoDB disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }
};