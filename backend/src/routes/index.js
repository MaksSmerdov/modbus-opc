import express from 'express';
import configRouter from './config/index.js';
import dataRouter from './data/index.js';

const router = express.Router();

// API конфигурации (CRUD)
router.use('/config', configRouter);

// API данных (real-time и история)
router.use('/data', dataRouter);

export default router;
export { setModbusManager } from './data/index.js';

