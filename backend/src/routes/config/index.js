import express from 'express';
import devicesRouter from './devices.js';
import profilesRouter from './profiles.js';
import templatesRouter from './templates.js';

const router = express.Router();

// Подключаем роуты
router.use('/devices', devicesRouter);
router.use('/profiles', profilesRouter);
router.use('/templates', templatesRouter);

export default router;

