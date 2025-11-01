import express from 'express';
import { getDeviceModel } from '../../models/data/index.js';
import { formatDate } from '../../utils/dateFormatter.js';

const router = express.Router();

let modbusManager = null;

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
  return diff < 60000;
}

function getDeviceData(device) {
  if (!isDataFresh(device)) {
    return null;
  }
  return device.data;
}

/**
 * @swagger
 * /api/data/devices:
 *   get:
 *     summary: Получить актуальные данные всех устройств
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: Массив данных устройств
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceData'
 *       503:
 *         description: Modbus не инициализирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Modbus не инициализирован
 */
router.get('/', (req, res) => {
  if (!modbusManager) {
    return res.status(503).json({ error: 'Modbus не инициализирован' });
  }

  const devices = modbusManager.devices.map(device => ({
    name: device.name,
    slaveId: device.slaveId,
    lastUpdated: device.lastSuccess ? formatDate(device.lastSuccess) : null,
    isResponding: device.failCount < device.retries,
    data: getDeviceData(device)
  }));

  res.json(devices);
});

/**
 * @swagger
 * /api/data/devices/{deviceName}:
 *   get:
 *     summary: Получить актуальные данные конкретного устройства
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: deviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Имя устройства
 *     responses:
 *       200:
 *         description: Данные устройства
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceData'
 *       404:
 *         description: Устройство не найдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Устройство не найдено
 *       503:
 *         description: Modbus не инициализирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Modbus не инициализирован
 */
router.get('/:deviceName', (req, res) => {
  if (!modbusManager) {
    return res.status(503).json({ error: 'Modbus не инициализирован' });
  }

  const deviceName = req.params.deviceName;

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
    isResponding: device.failCount < device.retries,
    data: getDeviceData(device)
  });
});

/**
 * @swagger
 * /api/data/devices/{deviceName}/history:
 *   get:
 *     summary: Получить исторические данные устройства
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: deviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Имя устройства
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Количество записей
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Начальная дата (ISO string или DD.MM.YYYY)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Конечная дата (ISO string или DD.MM.YYYY)
 *     responses:
 *       200:
 *         description: Исторические данные устройства
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricalData'
 *       500:
 *         description: Ошибка получения данных из БД
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ошибка получения данных из БД
 */
router.get('/:deviceName/history', async (req, res) => {
  try {
    const deviceNameFromUrl = req.params.deviceName;
    const deviceName = deviceNameFromUrl.charAt(0).toUpperCase() + deviceNameFromUrl.slice(1);

    const DeviceModel = getDeviceModel(deviceName);

    const limit = parseInt(req.query.limit) || 100;
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

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

