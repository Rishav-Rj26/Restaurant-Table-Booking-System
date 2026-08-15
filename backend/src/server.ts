import { createServer } from 'http';
import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';

const server = createServer(app);

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    server.listen(env.PORT, () => {
      console.log(`✅ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
