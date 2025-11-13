import express from 'express';
import { Tag, Device } from '../../../models/settings/index.js';
import { reinitializeModbus } from '../../../utils/modbusReloader.js';
import { logAudit } from '../../../utils/auditLogger.js';

const router = express.Router();

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags:
 *   get:
 *     summary: Получить список всех тэгов устройства
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *     responses:
 *       200:
 *         description: Список тэгов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Устройство не найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/devices/:deviceId/tags', async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Проверяем существование устройства
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    const tags = await Tag.find({ deviceId })
      .sort({ address: 1 })
      .lean();

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    console.error('Ошибка получения тэгов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения тэгов'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags/{id}:
 *   get:
 *     summary: Получить тэг по ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId тэга
 *     responses:
 *       200:
 *         description: Данные тэга
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Тэг не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/devices/:deviceId/tags/:id', async (req, res) => {
  try {
    const { deviceId, id } = req.params;

    const tag = await Tag.findOne({ _id: id, deviceId }).lean();

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Тэг не найден'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Ошибка получения тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения тэга'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags:
 *   post:
 *     summary: Создать новый тэг для устройства
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, length, name, dataType]
 *             properties:
 *               address:
 *                 type: integer
 *                 example: 0
 *               length:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Temperature
 *               category:
 *                 type: string
 *                 example: general
 *               functionCode:
 *                 type: string
 *                 enum: [holding, input, coil, discrete]
 *                 example: holding
 *               dataType:
 *                 type: string
 *                 enum: [int16, uint16, int32, uint32, float32, string, bits]
 *                 example: float32
 *               bitIndex:
 *                 type: integer
 *                 example: null
 *               byteOrder:
 *                 type: string
 *                 example: ABCD
 *               scale:
 *                 type: number
 *                 example: 1
 *               offset:
 *                 type: number
 *                 example: 0
 *               decimals:
 *                 type: integer
 *                 example: 2
 *               unit:
 *                 type: string
 *                 example: °C
 *               minValue:
 *                 type: number
 *                 example: null
 *               maxValue:
 *                 type: number
 *                 example: null
 *               description:
 *                 type: string
 *                 example: Температура котла
 *     responses:
 *       201:
 *         description: Тэг успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Устройство не найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/devices/:deviceId/tags', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const tagData = req.body;

    // Проверяем существование устройства
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    // Валидация
    if (!tagData.address && tagData.address !== 0) {
      return res.status(400).json({
        success: false,
        error: 'Адрес тэга обязателен'
      });
    }
    if (!tagData.length) {
      return res.status(400).json({
        success: false,
        error: 'Длина тэга обязательна'
      });
    }
    if (!tagData.name) {
      return res.status(400).json({
        success: false,
        error: 'Название тэга обязательно'
      });
    }
    if (!tagData.dataType) {
      return res.status(400).json({
        success: false,
        error: 'Тип данных тэга обязателен'
      });
    }

    // Создание тэга
    const tag = await Tag.create({
      ...tagData,
      deviceId
    });

    // Реинициализируем Modbus для применения изменений
    await reinitializeModbus();

    // Логируем создание тэга
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'create',
        entityType: 'tag',
        entityName: tag.name,
        fieldName: 'name',
        newValue: tag.name,
        req
      });
    }

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Ошибка создания тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания тэга'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags/{id}:
 *   put:
 *     summary: Обновить тэг
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId тэга
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: integer
 *               length:
 *                 type: integer
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               functionCode:
 *                 type: string
 *               dataType:
 *                 type: string
 *               bitIndex:
 *                 type: integer
 *               byteOrder:
 *                 type: string
 *               scale:
 *                 type: number
 *               offset:
 *                 type: number
 *               decimals:
 *                 type: integer
 *               unit:
 *                 type: string
 *               minValue:
 *                 type: number
 *               maxValue:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Тэг успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Тэг не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/devices/:deviceId/tags/:id', async (req, res) => {
  try {
    const { deviceId, id } = req.params;
    const tagData = req.body;

    // Получаем старые данные перед обновлением
    const oldTag = await Tag.findOne({ _id: id, deviceId }).lean();

    const tag = await Tag.findOneAndUpdate(
      { _id: id, deviceId },
      tagData,
      { new: true, runValidators: true }
    ).lean();

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Тэг не найден'
      });
    }

    // Реинициализируем Modbus для применения изменений
    await reinitializeModbus();

    // Логируем изменения
    if (req.user && oldTag) {
      if (oldTag.name !== tag.name) {
        await logAudit({
          user: req.user,
          action: 'update',
          entityType: 'tag',
          entityName: tag.name,
          fieldName: 'name',
          oldValue: oldTag.name,
          newValue: tag.name,
          req
        });
      }
      if (oldTag.address !== tag.address) {
        await logAudit({
          user: req.user,
          action: 'update',
          entityType: 'tag',
          entityName: tag.name,
          fieldName: 'address',
          oldValue: oldTag.address,
          newValue: tag.address,
          req
        });
      }
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Ошибка обновления тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления тэга'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags/{id}:
 *   delete:
 *     summary: Удалить тэг
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId тэга
 *     responses:
 *       200:
 *         description: Тэг успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Тэг удален
 *       404:
 *         description: Тэг не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/devices/:deviceId/tags/:id', async (req, res) => {
  try {
    const { deviceId, id } = req.params;

    // Получаем данные тэга перед удалением
    const tag = await Tag.findOne({ _id: id, deviceId }).lean();

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Тэг не найден'
      });
    }

    await Tag.findOneAndDelete({ _id: id, deviceId });

    // Реинициализируем Modbus для применения изменений
    await reinitializeModbus();

    // Логируем удаление тэга
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'delete',
        entityType: 'tag',
        entityName: tag.name,
        oldValue: tag.name,
        req
      });
    }

    res.json({
      success: true,
      message: 'Тэг удален'
    });
  } catch (error) {
    console.error('Ошибка удаления тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления тэга'
    });
  }
});

export default router;

