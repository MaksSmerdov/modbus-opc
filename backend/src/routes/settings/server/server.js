import express from 'express';
import { getServerSettings, updateServerSettings } from '../../../models/settings/index.js';
import { getModbusManager } from '../../../server.js';
import { reinitializeModbus } from '../../../utils/modbusReloader.js';

const router = express.Router();

/**
 * @swagger
 * /api/config/server:
 *   get:
 *     summary: Получить настройки сервера
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Настройки сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isPollingEnabled:
 *                       type: boolean
 *                       description: Включен ли опрос устройств
 *                     pollInterval:
 *                       type: integer
 *                       description: Интервал опроса Modbus устройств в миллисекундах
 *                       minimum: 1000
 *                       maximum: 60000
 *                       example: 5000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const settings = await getServerSettings();

        res.json({
            success: true,
            data: {
                isPollingEnabled: settings.isPollingEnabled,
                pollInterval: settings.pollInterval,
                createdAt: settings.createdAt,
                updatedAt: settings.updatedAt
            }
        });
    } catch (error) {
        console.error('Ошибка получения настроек сервера:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения настроек сервера'
        });
    }
});

/**
 * @swagger
 * /api/config/server:
 *   put:
 *     summary: Обновить настройки сервера
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPollingEnabled:
 *                 type: boolean
 *                 description: Включен ли опрос устройств
 *               pollInterval:
 *                 type: integer
 *                 description: Интервал опроса Modbus устройств в миллисекундах
 *                 minimum: 1000
 *                 maximum: 60000
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Настройки успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isPollingEnabled:
 *                       type: boolean
 *                     pollInterval:
 *                       type: integer
 *                     message:
 *                       type: string
 *                       example: Настройки обновлены. Modbus будет перезапущен.
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/', async (req, res) => {
    try {
        const { isPollingEnabled, pollInterval } = req.body;

        // Валидация
        if (pollInterval !== undefined && (pollInterval < 1000 || pollInterval > 60000)) {
            return res.status(400).json({
                success: false,
                error: 'pollInterval должен быть от 1000 до 60000 миллисекунд'
            });
        }

        // Подготавливаем обновления
        const updates = {};
        if (isPollingEnabled !== undefined) {
            updates.isPollingEnabled = isPollingEnabled;
        }
        if (pollInterval !== undefined) {
            updates.pollInterval = pollInterval;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Не указаны поля для обновления'
            });
        }

        // Обновляем настройки в БД
        const settings = await updateServerSettings(updates);

        const manager = getModbusManager();

        if (manager) {
            // Если изменился pollInterval, обновляем его и перезапускаем опрос
            if (pollInterval !== undefined) {
                const wasPolling = manager.isPolling;

                // Останавливаем опрос если он был запущен
                if (wasPolling) {
                    manager.stopPolling();
                }

                // Обновляем pollInterval в менеджере
                manager.pollInterval = pollInterval;

                // Перезапускаем опрос если он был запущен и включен в настройках
                if (wasPolling && settings.isPollingEnabled) {
                    manager.startPolling();
                }
            }

            // Если изменился isPollingEnabled, обновляем состояние опроса
            if (isPollingEnabled !== undefined) {
                if (isPollingEnabled && !manager.isPolling) {
                    manager.startPolling();
                } else if (!isPollingEnabled && manager.isPolling) {
                    manager.stopPolling();
                }
            }
        } else {
            // Если менеджера нет, но изменился pollInterval, реинициализируем Modbus
            if (pollInterval !== undefined) {
                await reinitializeModbus();
            }
        }

        res.json({
            success: true,
            data: {
                isPollingEnabled: settings.isPollingEnabled,
                pollInterval: settings.pollInterval,
                message: pollInterval !== undefined
                    ? 'Настройки обновлены. Интервал опроса изменен.'
                    : 'Настройки обновлены'
            }
        });
    } catch (error) {
        console.error('Ошибка обновления настроек сервера:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления настроек сервера'
        });
    }
});

export default router;

