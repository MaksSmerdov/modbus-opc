import express from 'express';
import { getDeviceModel } from '../../models/data/index.js';
import { formatDate } from '../../utils/dateFormatter.js';
import { getModbusManager } from '../../server.js';

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
    slug: device.slug,
    slaveId: device.slaveId,
    lastUpdated: device.lastSuccess ? formatDate(device.lastSuccess) : null,
    isResponding: device.failCount < device.retries,
    data: getDeviceData(device)
  }));

  res.json(devices);
});

/**
 * @swagger
 * /api/data/devices/{deviceSlug}:
 *   get:
 *     summary: Получить актуальные данные конкретного устройства
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: deviceSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: API ключ (slug) устройства
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

  const deviceSlug = req.params.deviceName;

  const device = modbusManager.devices.find(d =>
    d.slug === deviceSlug.toLowerCase()
  );

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  res.json({
    name: device.name,
    slug: device.slug,
    slaveId: device.slaveId,
    lastUpdated: device.lastSuccess ? formatDate(device.lastSuccess) : null,
    isResponding: device.failCount < device.retries,
    data: getDeviceData(device)
  });
});

/**
 * @swagger
 * /api/data/devices/{deviceSlug}/history:
 *   get:
 *     summary: Получить исторические данные устройства
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: deviceSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: API ключ (slug) устройства
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
    const deviceSlug = req.params.deviceName.toLowerCase(); // На самом деле это slug

    // Находим устройство по slug чтобы получить его slug для модели
    const manager = modbusManager || getModbusManager();
    if (!manager) {
      return res.status(503).json({ error: 'Modbus не инициализирован' });
    }

    const device = manager.devices.find(d => d.slug === deviceSlug);
    if (!device) {
      return res.status(404).json({ error: 'Устройство не найдено' });
    }

    const DeviceModel = getDeviceModel(device.slug);

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
      deviceName: device.name,
      deviceSlug: device.slug,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error.message);
    res.status(500).json({ error: 'Ошибка получения данных из БД' });
  }
});

export default router;

