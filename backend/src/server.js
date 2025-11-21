import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import connectDB from './utils/database.js';
import { initModbus } from './services/modbusInit.js';
import apiRouter, { setModbusManager } from './routes/index.js';
import { setReinitializeFunction } from './utils/modbusReloader.js';
import { swaggerSpec } from './config/swagger.js';
import { getServerSettings } from './models/settings/index.js';

const app = express();
const { port, host } = config.server;

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к собранному фронтенду
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Подключение к базе данных
void connectDB();

// Инициализация Modbus
let modbusManager = null;

// Экспортируем функцию для доступа к менеджеру
export function getModbusManager() {
  return modbusManager;
}

// Функция для реинициализации Modbus
async function reinitializeModbusInternal() {
  try {
    console.log('🔄 Перезапуск Modbus Manager...');

    // Останавливаем старый менеджер
    if (modbusManager) {
      await modbusManager.disconnect();
      modbusManager = null;
    }

    // Создаём новый менеджер
    modbusManager = await initModbus();
    setModbusManager(modbusManager);

    // Применяем состояние опроса из БД
    if (modbusManager) {
      const settings = await getServerSettings();
      if (settings.isPollingEnabled) {
        if (!modbusManager.isPolling) {
          modbusManager.startPolling();
          console.log('✓ Опрос запущен после реинициализации (глобальный опрос включен)');
        }
      } else {
        console.log('⏸ Опрос не запущен после реинициализации (глобальный опрос выключен)');
      }
    }

    console.log('✓ Modbus Manager успешно перезапущен');
    return true;
  } catch (error) {
    console.error('✗ Ошибка перезапуска Modbus:', error.message);
    return false;
  }
}

// Регистрируем функцию реинициализации
setReinitializeFunction(reinitializeModbusInternal);

// Запускаем Modbus после небольшой задержки
setTimeout(async () => {
  try {
    modbusManager = await initModbus();
    setModbusManager(modbusManager);

    // Читаем состояние опроса из БД и применяем его
    if (modbusManager) {
      const settings = await getServerSettings();
      if (settings.isPollingEnabled && !modbusManager.isPolling) {
        modbusManager.startPolling();
        console.log('✓ Опрос автоматически запущен (состояние из БД: включено)');
      } else if (!settings.isPollingEnabled && modbusManager.isPolling) {
        modbusManager.stopPolling();
        console.log('⏸ Опрос автоматически остановлен (состояние из БД: выключено)');
      }
    }
  } catch (error) {
    console.error('Не удалось инициализировать Modbus');
  }
}, 1000);

// Middleware
// CORS - разрешаем запросы с любых источников в режиме разработки
app.use(cors({
  origin: config.env === 'development' ? '*' : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Modbus OPC Server API Documentation',
}));

// API роуты (должны быть ПЕРЕД статическими файлами)
app.use('/api', apiRouter);

// Раздача статических файлов фронтенда
app.use(express.static(frontendDistPath));

// Fallback для SPA - все остальные запросы возвращают index.html
app.use((req, res, next) => {
  // Пропускаем API и Swagger запросы
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next();
  }
  
  // Пропускаем запросы к статическим файлам (с расширениями)
  if (req.path.includes('.')) {
    return next();
  }
  
  // Для всех остальных GET запросов возвращаем index.html
  if (req.method === 'GET') {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
  
  next();
});

// Запуск сервера
app.listen(port, host, () => {
  console.log(`Сервер запущен на http://${host}:${port}`);
});

// Корректное завершение при выходе
process.on('SIGINT', async () => {
  console.log('\n\nЗавершение работы...');
  if (modbusManager) {
    await modbusManager.disconnect();
  }
  process.exit(0);
});