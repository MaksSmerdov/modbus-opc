import mongoose from 'mongoose';
import { config } from '../config/env.js';

async function connectDB() {
  try {
    await mongoose.connect(config.database.uri);
    console.log('✓ MongoDB подключен');
  } catch (error) {
    console.error('✗ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
}

export default connectDB;