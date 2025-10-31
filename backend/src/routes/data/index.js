import express from 'express';
import devicesRouter from './devices.js';

const router = express.Router();

router.use('/devices', devicesRouter);

export default router;
export { setModbusManager } from './devices.js';

