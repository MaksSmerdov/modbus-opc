import mongoose from 'mongoose';
import { config } from '../config/env.js';


export const configDB = mongoose.createConnection();
export const dataDB = mongoose.createConnection();

/**
 * Подключается к обеим базам данных
 */
async function connectDB() {
  try {
    await configDB.openUri(config.database.configUri);
    console.log('✓ MongoDB Config DB подключена');

    await dataDB.openUri(config.database.dataUri);
    console.log('✓ MongoDB Data DB подключена');

  } catch (error) {
    console.error('✗ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await configDB.close();
    await dataDB.close();
    console.log('✓ Подключения к БД закрыты');
  } catch (error) {
    console.error('✗ Ошибка закрытия подключений:', error.message);
  }
}

export default connectDB;