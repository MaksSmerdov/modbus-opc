import express from 'express';
import configRouter from './settings/index.js';
import dataRouter from './data/index.js';
import pollingRouter from './polling/polling.js';
import authRouter from './auth/auth.js';
import usersRouter from './users/user.js';
import auditRouter from './audit/audit.js';
import logsRouter from './logs/logs.js';
import { authMiddleware, adminOrOperatorMiddleware, adminOnlyMiddleware } from '../middleware/auth.js';
import { getModbusManager } from '../server.js';
import { getServerSettings } from '../models/settings/index.js';

const router = express.Router();

// API аутентификации (публичные роуты)
router.use('/auth', authRouter);

// API управления пользователями
// /users/me - доступен всем авторизованным
// /users/* - только для admin (проверка внутри user.js)
router.use('/users', authMiddleware, usersRouter);

// API аудита - только для admin
router.use('/audit', authMiddleware, auditRouter);

// API логов - доступны всем авторизованным
router.use('/logs', logsRouter);

// API конфигурации - только для admin и operator
router.use('/config', authMiddleware, adminOrOperatorMiddleware, configRouter);

// API данных (real-time и история) - доступны всем авторизованным
router.use('/data', dataRouter);

// Статус опроса доступен всем авторизованным (включая viewer)
router.get('/polling/status', authMiddleware, async (req, res) => {
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

// API управления опросом (start/stop) - только для admin и operator
router.use('/polling', authMiddleware, adminOrOperatorMiddleware, pollingRouter);

export default router;
export { setModbusManager } from './data/index.js';