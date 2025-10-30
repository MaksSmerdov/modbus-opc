import express from 'express';
import { getDeviceModel } from '../models/DeviceData.js';
import { formatDate } from '../utils/dateFormatter.js';

const router = express.Router();

let modbusManager = null;

/**
 * Устанавливает ссылку на ModbusManager
 */
export function setModbusManager(manager) {
  modbusManager = manager;
}

/**
 * Проверяет, актуальны ли данные устройства (не старше 1 минуты)
 * @param {Object} device - Устройство
 * @returns {boolean} true если данные актуальны
 */
function isDataFresh(device) {
  if (!device.lastSuccess) {
    return false;
  }
  const now = new Date();
  const diff = now - device.lastSuccess;
  return diff < 60000; // 60 секунд
}

/**
 * Получить данные устройства с проверкой актуальности
 * @param {Object} device - Устройство
 * @returns {Object} Данные устройства или null если устарели
 */
function getDeviceData(device) {
  if (!isDataFresh(device)) {
    return null;
  }
  return device.data;
}

/**
 * GET /api/devices
 * Возвращает данные всех устройств
 */
router.get('/devices', (req, res) => {
  if (!modbusManager) {
    return res.status(503).json({ error: 'Modbus не инициализирован' });
  }

  const devices = modbusManager.devices.map(device => ({
    name: device.name,
    slaveId: device.slaveId,
    lastUpdated: device.lastSuccess ? formatDate(device.lastSuccess) : null,
    isResponding: device.failCount < modbusManager.retries,
    data: getDeviceData(device)
  }));

  res.json(devices);
});

/**
 * GET /api/:deviceName-data
 * Возвращает актуальные данные конкретного устройства по имени
 * Примеры: /api/boiler1-data, /api/boiler2-data
 */
router.get('/:deviceName-data', (req, res) => {
  if (!modbusManager) {
    return res.status(503).json({ error: 'Modbus не инициализирован' });
  }

  // Преобразуем имя из URL (boiler1 -> Boiler1)
  const deviceNameFromUrl = req.params.deviceName;
  const deviceName = deviceNameFromUrl.charAt(0).toUpperCase() + deviceNameFromUrl.slice(1);

  const device = modbusManager.devices.find(d => 
    d.name.toLowerCase() === deviceName.toLowerCase()
  );

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  res.json({
    name: device.name,
    slaveId: device.slaveId,
    lastUpdated: device.lastSuccess ? formatDate(device.lastSuccess) : null,
    isResponding: device.failCount < modbusManager.retries,
    data: getDeviceData(device)
  });
});

/**
 * GET /api/:deviceName-history
 * Возвращает исторические данные устройства из БД
 * Query параметры:
 * - limit: количество записей (по умолчанию 100)
 * - from: начальная дата (ISO string или DD.MM.YYYY)
 * - to: конечная дата (ISO string или DD.MM.YYYY)
 * 
 * Примеры: 
 * /api/boiler1-history?limit=50
 * /api/boiler1-history?from=2025-10-30T00:00:00Z&to=2025-10-30T23:59:59Z
 */
router.get('/:deviceName-history', async (req, res) => {
  try {
    const deviceNameFromUrl = req.params.deviceName;
    const deviceName = deviceNameFromUrl.charAt(0).toUpperCase() + deviceNameFromUrl.slice(1);

    // Получаем модель для конкретного устройства
    const DeviceModel = getDeviceModel(deviceName);

    const limit = parseInt(req.query.limit) || 100;
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    // Строим запрос
    const query = {};
    
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = from;
      if (to) query.timestamp.$lte = to;
    }

    const data = await DeviceModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-__v')
      .lean();

    res.json({
      deviceName,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error.message);
    res.status(500).json({ error: 'Ошибка получения данных из БД' });
  }
});

export default router;

