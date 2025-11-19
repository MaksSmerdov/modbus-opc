import express from 'express';
import { AvailablePort } from '../../models/settings/index.js';
import { logAudit } from '../../utils/auditLogger.js';
import { adminOnlyMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/config/available-ports:
 *   get:
 *     summary: Получить настройки всех доступных COM-портов (только для админа)
 *     tags: [AvailablePorts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список настроек портов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       portName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isHidden:
 *                         type: boolean
 */
router.get('/', adminOnlyMiddleware, async (req, res) => {
  try {
    const settings = await AvailablePort.find()
      .sort({ portName: 1 })
      .lean();

    res.json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    console.error('Ошибка получения настроек портов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения настроек портов'
    });
  }
});

/**
 * @swagger
 * /api/config/available-ports/{portName}:
 *   put:
 *     summary: Обновить настройки COM-порта (только для админа)
 *     tags: [AvailablePorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portName
 *         required: true
 *         schema:
 *           type: string
 *         description: Имя COM-порта (например, COM1)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               isHidden:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Настройки порта обновлены
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:portName', adminOnlyMiddleware, async (req, res) => {
  try {
    const { portName } = req.params;
    const { description, isHidden } = req.body;

    // Валидация
    if (typeof isHidden !== 'undefined' && typeof isHidden !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isHidden должен быть boolean'
      });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'description должен быть строкой'
      });
    }

    const normalizedPortName = portName.toUpperCase();
    
    if (!normalizedPortName.match(/^COM\d+$/)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректное имя COM-порта'
      });
    }

    // Обновляем или создаем настройки
    const settings = await AvailablePort.findOneAndUpdate(
      { portName: normalizedPortName },
      {
        portName: normalizedPortName,
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isHidden !== undefined && { isHidden })
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Логируем изменение
    if (req.user) {
      await logAudit({
        user: req.user,
        action: settings.isNew ? 'create' : 'update',
        entityType: 'availablePort',
        entityName: normalizedPortName,
        fieldName: 'settings',
        newValue: JSON.stringify({ description: settings.description, isHidden: settings.isHidden }),
        req
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Ошибка обновления настроек порта:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления настроек порта'
    });
  }
});

/**
 * @swagger
 * /api/config/available-ports/{portName}:
 *   delete:
 *     summary: Удалить настройки COM-порта (только для админа)
 *     tags: [AvailablePorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portName
 *         required: true
 *         schema:
 *           type: string
 *         description: Имя COM-порта (например, COM1)
 *     responses:
 *       200:
 *         description: Настройки порта удалены
 *       404:
 *         description: Настройки порта не найдены
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:portName', adminOnlyMiddleware, async (req, res) => {
  try {
    const { portName } = req.params;
    const normalizedPortName = portName.toUpperCase();

    const settings = await AvailablePort.findOneAndDelete({ portName: normalizedPortName });

    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Настройки порта не найдены'
      });
    }

    // Логируем удаление
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'delete',
        entityType: 'availablePort',
        entityName: normalizedPortName,
        oldValue: JSON.stringify({ description: settings.description, isHidden: settings.isHidden }),
        req
      });
    }

    res.json({
      success: true,
      message: 'Настройки порта удалены'
    });
  } catch (error) {
    console.error('Ошибка удаления настроек порта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления настроек порта'
    });
  }
});

export default router;

