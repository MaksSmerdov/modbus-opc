import express from 'express';
import { getModbusManager } from '../../server.js';
import { getServerSettings, updatePollingState } from '../../models/settings/index.js';

const router = express.Router();

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

