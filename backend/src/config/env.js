import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Режим работы
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Сервер
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || 'localhost'
  },

  // Базы данных
  database: {
    // БД для конфигурации устройств
    configUri: process.env.MONGODB_CONFIG_URI || 'mongodb://localhost:27017/modbus-config',
    // БД для исторических данных
    dataUri: process.env.MONGODB_DATA_URI || 'mongodb://localhost:27017/modbus-data'
  },
};

// Логируем текущую конфигурацию при запуске
console.log(`\n🚀 Режим: ${config.env}`);
console.log(`📡 Сервер: http://${config.server.host}:${config.server.port}`);
console.log(`💾 БД конфигурации: ${config.database.configUri}`);
console.log(`💾 БД данных: ${config.database.dataUri}\n`);