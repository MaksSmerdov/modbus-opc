import express from 'express';
import configRouter from './settings/index.js';
import dataRouter from './data/index.js';
import pollingRouter from './polling.js';

const router = express.Router();

// API конфигурации (CRUD)
router.use('/config', configRouter);

// API данных (real-time и история)
router.use('/data', dataRouter);

// API управления опросом
router.use('/polling', pollingRouter);

export default router;
export { setModbusManager } from './data/index.js';

