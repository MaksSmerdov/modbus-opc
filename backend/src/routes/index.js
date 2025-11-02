import express from 'express';
import configRouter from './settings/index.js';
import dataRouter from './data/index.js';
import pollingRouter from './polling/polling.js';
import authRouter from './auth/auth.js';
import usersRouter from './users/user.js';
import { authMiddleware, adminOrOperatorMiddleware, adminOnlyMiddleware } from '../middleware/auth.js';

const router = express.Router();

// API аутентификации (публичные роуты)
router.use('/auth', authRouter);

// API управления пользователями - только для admin
router.use('/users', authMiddleware, adminOnlyMiddleware, usersRouter);

// API конфигурации - только для admin и operator
router.use('/config', authMiddleware, adminOrOperatorMiddleware, configRouter);

// API данных (real-time и история) - доступны всем авторизованным
router.use('/data', authMiddleware, dataRouter);

// API управления опросом - только для admin и operator
router.use('/polling', authMiddleware, adminOrOperatorMiddleware, pollingRouter);

export default router;
export { setModbusManager } from './data/index.js';