import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * Получить логи приложения
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLogs = (req, res) => {
  try {
    const { limit = 100, level } = req.query;
    const logs = logger.getLogs(parseInt(limit), level || null);

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения логов',
    });
  }
};

/**
 * Очистить все логи
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const clearLogs = (req, res) => {
  try {
    logger.clear();
    res.json({
      success: true,
      message: 'Логи очищены',
    });
  } catch (error) {
    console.error('Ошибка очистки логов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка очистки логов',
    });
  }
};

/**
 * @swagger
 * /api/console:
 *   get:
 *     summary: Получить логи приложения
 *     tags: [Console]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Максимальное количество логов
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [log, warn, error]
 *         description: Фильтр по уровню лога
 *     responses:
 *       200:
 *         description: Список логов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 */
router.get('/', authMiddleware, getLogs);

/**
 * @swagger
 * /api/console:
 *   delete:
 *     summary: Очистить все логи
 *     tags: [Console]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Логи очищены
 */
router.delete('/', authMiddleware, clearLogs);

export default router;

