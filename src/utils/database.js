import mongoose from 'mongoose';
import dbConfig from '../config/database.js';

/**
 * Подключение к MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log('✓ Подключение к MongoDB успешно установлено');
  } catch (error) {
    console.error('✗ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Обработка событий подключения
 */
mongoose.connection.on('disconnected', () => {
  console.log('⚠ MongoDB отключена');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ Ошибка MongoDB:', error.message);
});

export default connectDB;

