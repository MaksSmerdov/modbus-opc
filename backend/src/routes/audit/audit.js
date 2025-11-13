import express from 'express';
import { AuditLog } from '../../models/audit/AuditLog.js';
import { adminOnlyMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Получить логи аудита (только admin)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [device, port, tag, user, polling]
 */
router.get('/', adminOnlyMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      entityType
    } = req.query;

    const filter = {};
    if (entityType) filter.entityType = entityType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка получения логов аудита:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения логов аудита'
    });
  }
});

/**
 * @swagger
 * /api/audit/{id}:
 *   delete:
 *     summary: Удалить один лог аудита (только admin)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', adminOnlyMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findByIdAndDelete(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Лог не найден'
      });
    }

    res.json({
      success: true,
      message: 'Лог успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления лога:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления лога'
    });
  }
});

/**
 * @swagger
 * /api/audit:
 *   delete:
 *     summary: Удалить логи аудита (только admin)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата для удаления логов за конкретный день (YYYY-MM-DD). Если не указана - удаляются все логи.
 */
router.delete('/', adminOnlyMiddleware, async (req, res) => {
  try {
    const { date } = req.query;

    let filter = {};
    if (date) {
      // Создаем диапазон для конкретного дня
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const result = await AuditLog.deleteMany(filter);

    res.json({
      success: true,
      message: date
        ? `Удалено ${result.deletedCount} логов за ${date}`
        : `Удалено ${result.deletedCount} логов`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Ошибка удаления логов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления логов'
    });
  }
});

export default router;

