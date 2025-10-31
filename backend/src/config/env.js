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

  // База данных
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/modbus-opc'
  },
};

// Логируем текущую конфигурацию при запуске
console.log(`\n🚀 Режим: ${config.env}`);
console.log(`📡 Сервер: http://${config.server.host}:${config.server.port}`);
console.log(`💾 База данных: ${config.database.uri}\n`);