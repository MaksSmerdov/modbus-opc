import express from 'express';
import { config } from './config/env.js';
import connectDB from './utils/database.js';
import { initModbus } from './services/modbusInit.js';
import devicesRouter, { setModbusManager } from './routes/devices.js';

const app = express();
const { port, host } = config.server;

// Подключение к базе данных
connectDB();

// Инициализация Modbus
let modbusManager = null;

// Запускаем Modbus после небольшой задержки
setTimeout(async () => {
  try {
    modbusManager = await initModbus();
    setModbusManager(modbusManager);
  } catch (error) {
    console.error('Не удалось инициализировать Modbus');
  }
}, 1000);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Modbus OPC Server is running',
    environment: config.env,
    host: host,
    port: port
  });
});

// Подключаем роуты устройств
app.use('/api', devicesRouter);

// Запуск сервера
app.listen(port, host, () => { 
  console.log(`✓ API доступен на http://${host}:${port}/api/devices`);
});

// Корректное завершение при выходе
process.on('SIGINT', async () => {
  console.log('\n\nЗавершение работы...');
  if (modbusManager) {
    await modbusManager.disconnect();
  }
  process.exit(0);
});