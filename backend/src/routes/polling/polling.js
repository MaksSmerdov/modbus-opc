import express from 'express';
import { getModbusManager } from '../../server.js';
import { getServerSettings, updatePollingState } from '../../models/settings/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/polling/status:
 *   get:
 *     summary: Получить статус опроса
 *     tags: [Polling]
 *     responses:
 *       200:
 *         description: Статус опроса
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isPolling:
 *                   type: boolean
 *                   description: Включен ли опрос
 *                 hasManager:
 *                   type: boolean
 *                   description: Инициализирован ли менеджер
 *                 isPollingEnabled:
 *                   type: boolean
 *                   description: Включен ли опрос в настройках БД
 *                 pollInterval:
 *                   type: integer
 *                   description: Интервал опроса из настроек БД (мс)
 *                 currentPollInterval:
 *                   type: integer
 *                   nullable: true
 *                   description: Текущий интервал опроса в менеджере (мс), null если менеджер не инициализирован
 *       500:
 *         description: Ошибка сервера
 */
router.get('/status', async (req, res) => {
  try {
    const manager = getModbusManager();
    const settings = await getServerSettings();

    if (!manager) {
      return res.json({
        isPolling: false,
        hasManager: false,
        isPollingEnabled: settings.isPollingEnabled,
        pollInterval: settings.pollInterval,
        currentPollInterval: null
      });
    }

    res.json({
      isPolling: manager.isPolling,
      hasManager: true,
      isPollingEnabled: settings.isPollingEnabled,
      pollInterval: settings.pollInterval,
      currentPollInterval: manager.pollInterval
    });
  } catch (error) {
    console.error('Ошибка получения статуса опроса:', error);
    res.status(500).json({
      error: 'Ошибка получения статуса опроса',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/polling/start:
 *   post:
 *     summary: Запустить опрос устройств
 *     tags: [Polling]
 *     responses:
 *       200:
 *         description: Опрос запущен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isPolling:
 *                   type: boolean
 *       400:
 *         description: Опрос уже запущен или менеджер не инициализирован
 *       500:
 *         description: Ошибка сервера
 */
router.post('/start', async (req, res) => {
  try {
    const manager = getModbusManager();

    if (!manager) {
      return res.status(400).json({
        error: 'Modbus Manager не инициализирован',
        message: 'Добавьте устройства и порты для инициализации'
      });
    }

    if (manager.isPolling) {
      return res.status(400).json({
        error: 'Опрос уже запущен',
        isPolling: true
      });
    }

    // Обновляем состояние в БД
    await updatePollingState(true);

    manager.startPolling();
    console.log('✓ Опрос устройств запущен');

    res.json({
      message: 'Опрос успешно запущен',
      isPolling: true
    });
  } catch (error) {
    console.error('Ошибка запуска опроса:', error);
    res.status(500).json({
      error: 'Ошибка запуска опроса',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/polling/stop:
 *   post:
 *     summary: Остановить опрос устройств
 *     tags: [Polling]
 *     responses:
 *       200:
 *         description: Опрос остановлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isPolling:
 *                   type: boolean
 *       400:
 *         description: Опрос уже остановлен или менеджер не инициализирован
 *       500:
 *         description: Ошибка сервера
 */
router.post('/stop', async (req, res) => {
  try {
    const manager = getModbusManager();

    if (!manager) {
      return res.status(400).json({
        error: 'Modbus Manager не инициализирован',
        message: 'Нет активного менеджера для остановки'
      });
    }

    if (!manager.isPolling) {
      return res.status(400).json({
        error: 'Опрос уже остановлен',
        isPolling: false
      });
    }

    // Обновляем состояние в БД
    await updatePollingState(false);

    manager.stopPolling();
    console.log('✓ Опрос устройств остановлен');

    res.json({
      message: 'Опрос успешно остановлен',
      isPolling: false
    });
  } catch (error) {
    console.error('Ошибка остановки опроса:', error);
    res.status(500).json({
      error: 'Ошибка остановки опроса',
      message: error.message
    });
  }
});

export default router;

