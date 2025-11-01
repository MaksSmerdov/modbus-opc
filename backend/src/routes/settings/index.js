import express from 'express';
import devicesRouter from './devices.js';
import portsRouter from './ports.js';
import tagsRouter from './tags.js';
import serverRouter from './server.js';

const router = express.Router();

// Подключаем роуты
router.use('/devices', devicesRouter);
router.use('/ports', portsRouter);
router.use('/server', serverRouter);
router.use('/', tagsRouter); // Роуты для тэгов включают в себя путь /devices/:deviceId/tags

export default router;

