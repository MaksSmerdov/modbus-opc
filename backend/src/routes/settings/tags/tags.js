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
        error: 'Устройство не найдено',
      });
    }

    // Сортируем по order, если оно есть, иначе по address
    const tags = await Tag.find({ deviceId }).sort({ order: 1, address: 1 }).lean();

    res.json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    console.error('Ошибка получения тэгов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения тэгов',
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags/reorder:
 *   put:
 *     summary: Изменить порядок тегов
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
 *             required: [tagIds]
 *             properties:
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив ID тегов в новом порядке
 *                 example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]
 *     responses:
 *       200:
 *         description: Порядок тегов успешно обновлен
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
 *                   example: Порядок тегов обновлен
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
router.put('/devices/:deviceId/tags/reorder', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { tagIds } = req.body;

    // Проверяем существование устройства
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено',
      });
    }

    // Валидация
    if (!Array.isArray(tagIds)) {
      return res.status(400).json({
        success: false,
        error: 'tagIds должен быть массивом',
      });
    }

    if (tagIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Массив tagIds не может быть пустым',
      });
    }

    // Проверяем, что все теги принадлежат данному устройству
    const tags = await Tag.find({
      _id: { $in: tagIds },
      deviceId,
    }).lean();

    if (tags.length !== tagIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Некоторые теги не найдены или не принадлежат данному устройству',
      });
    }

    // Обновляем порядок каждого тега
    const updatePromises = tagIds.map((tagId, index) => {
      return Tag.updateOne(
        { _id: tagId, deviceId },
        { order: index }
      );
    });

    await Promise.all(updatePromises);

    // Логируем изменение порядка
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'update',
        entityType: 'tag',
        entityName: 'Порядок тегов',
        fieldName: 'order',
        newValue: `Изменен порядок ${tagIds.length} тегов`,
        req,
      });
    }

    res.json({
      success: true,
      message: 'Порядок тегов обновлен',
    });
  } catch (error) {
    console.error('Ошибка обновления порядка тегов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления порядка тегов',
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
        error: 'Тэг не найден',
      });
    }

    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Ошибка получения тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения тэга',
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
        error: 'Устройство не найдено',
      });
    }

    // Валидация
    if (!tagData.address && tagData.address !== 0) {
      return res.status(400).json({
        success: false,
        error: 'Адрес тэга обязателен',
      });
    }
    if (!tagData.length) {
      return res.status(400).json({
        success: false,
        error: 'Длина тэга обязательна',
      });
    }
    if (!tagData.name) {
      return res.status(400).json({
        success: false,
        error: 'Название тэга обязательно',
      });
    }
    if (!tagData.dataType) {
      return res.status(400).json({
        success: false,
        error: 'Тип данных тэга обязателен',
      });
    }

    // Определяем порядок для нового тега
    // Если order не указан, устанавливаем максимальный order + 1
    let order = tagData.order;
    if (order === undefined || order === null) {
      const maxOrderTag = await Tag.findOne({ deviceId, order: { $ne: null } })
        .sort({ order: -1 })
        .select('order')
        .lean();
      order = maxOrderTag && maxOrderTag.order !== null ? maxOrderTag.order + 1 : 0;
    }

    // Создание тэга
    const tag = await Tag.create({
      ...tagData,
      deviceId,
      order,
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
        req,
      });
    }

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Ошибка создания тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания тэга',
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

    const tag = await Tag.findOneAndUpdate({ _id: id, deviceId }, tagData, { new: true, runValidators: true }).lean();

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Тэг не найден',
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
          req,
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
          req,
        });
      }
    }

    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Ошибка обновления тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления тэга',
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
        error: 'Тэг не найден',
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
        req,
      });
    }

    res.json({
      success: true,
      message: 'Тэг удален',
    });
  } catch (error) {
    console.error('Ошибка удаления тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления тэга',
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{deviceId}/tags/{id}/clone:
 *   post:
 *     summary: Клонировать тэг
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
 *       201:
 *         description: Тэг успешно скопирован
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
/**
 * Типы данных, для которых требуется уникальность адреса
 */
const ADDRESS_VALIDATION_TYPES = ['int16', 'uint16', 'int32', 'uint32', 'float32'];

/**
 * Проверяет, перекрываются ли диапазоны адресов
 */
function addressRangesOverlap(start1, length1, start2, length2) {
  const end1 = start1 + length1 - 1;
  const end2 = start2 + length2 - 1;
  return start1 <= end2 && start2 <= end1;
}

/**
 * Находит свободный адрес для клонированного тэга
 * @param {string} deviceId - ID устройства
 * @param {number} startAddress - Начальный адрес для поиска
 * @param {number} tagLength - Длина тэга
 * @param {string} dataType - Тип данных тэга
 * @returns {Promise<number>} - Свободный адрес
 */
async function findFreeAddress(deviceId, startAddress, tagLength, dataType) {
  // Если тип данных не требует уникальности адреса, возвращаем исходный адрес
  if (!ADDRESS_VALIDATION_TYPES.includes(dataType)) {
    return startAddress;
  }

  // Для типа 'bits' несколько тэгов могут быть на одном адресе
  if (dataType === 'bits') {
    return startAddress;
  }

  // Получаем все существующие тэги устройства с типами, требующими уникальности адреса
  const existingTags = await Tag.find({
    deviceId,
    dataType: { $in: ADDRESS_VALIDATION_TYPES },
  }).lean();

  // Начинаем поиск с адреса исходного тэга + его длина
  let newAddress = startAddress + tagLength;
  const MAX_ADDRESS = 65535;

  // Ищем свободный диапазон адресов
  while (newAddress + tagLength - 1 <= MAX_ADDRESS) {
    let isFree = true;

    // Проверяем, не перекрывается ли диапазон с существующими тэгами
    for (const existingTag of existingTags) {
      const existingLength = existingTag.length || 1;

      if (addressRangesOverlap(newAddress, tagLength, existingTag.address, existingLength)) {
        isFree = false;
        break;
      }
    }

    // Если нашли свободный адрес, возвращаем его
    if (isFree) {
      return newAddress;
    }

    // Переходим к следующему адресу
    newAddress++;
  }

  // Если не нашли свободный адрес, возвращаем исходный (будет ошибка при сохранении)
  return startAddress;
}

router.post('/devices/:deviceId/tags/:id/clone', async (req, res) => {
  try {
    const { deviceId, id } = req.params;

    const sourceTag = await Tag.findOne({ _id: id, deviceId }).lean();

    if (!sourceTag) {
      return res.status(404).json({
        success: false,
        error: 'Тэг не найден',
      });
    }

    // Получаем длину тэга
    const tagLength = sourceTag.length || 1;

    // Находим свободный адрес для клонированного тэга
    const freeAddress = await findFreeAddress(deviceId, sourceTag.address, tagLength, sourceTag.dataType);

    // Определяем порядок для клонированного тега
    // Устанавливаем максимальный order + 1
    const maxOrderTag = await Tag.findOne({ deviceId, order: { $ne: null } })
      .sort({ order: -1 })
      .select('order')
      .lean();
    const order = maxOrderTag && maxOrderTag.order !== null ? maxOrderTag.order + 1 : 0;

    // Создаем копию тэга
    const clonedTagData = {
      deviceId: sourceTag.deviceId,
      address: freeAddress,
      length: tagLength,
      category: sourceTag.category,
      functionCode: sourceTag.functionCode,
      dataType: sourceTag.dataType,
      bitIndex: sourceTag.bitIndex,
      byteOrder: sourceTag.byteOrder,
      scale: sourceTag.scale,
      offset: sourceTag.offset,
      decimals: sourceTag.decimals,
      unit: sourceTag.unit,
      minValue: sourceTag.minValue,
      maxValue: sourceTag.maxValue,
      description: sourceTag.description,
      order,
    };

    // Извлекаем базовое имя (убираем суффикс "(число)" если есть)
    const copyPattern = /^(.+) \((\d+)\)$/;
    const nameMatch = sourceTag.name.match(copyPattern);
    const baseName = nameMatch ? nameMatch[1] : sourceTag.name;

    // Находим максимальный номер среди всех копий базового имени в этом устройстве
    const allTags = await Tag.find({ deviceId }).lean();

    let maxNumber = 0;
    for (const tag of allTags) {
      const match = tag.name.match(copyPattern);
      if (match) {
        const tagBaseName = match[1];
        const number = parseInt(match[2], 10);
        // Проверяем, что базовое имя совпадает с исходным
        if (tagBaseName === baseName && !isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    }

    // Начинаем с максимального номера + 1
    let counter = maxNumber + 1;
    let newName = `${baseName} (${counter})`;

    // Дополнительная проверка на случай параллельных запросов
    while (await Tag.findOne({ deviceId, name: newName })) {
      counter++;
      newName = `${baseName} (${counter})`;
    }
    clonedTagData.name = newName;

    const clonedTag = await Tag.create(clonedTagData);

    // Реинициализируем Modbus
    await reinitializeModbus();

    res.status(201).json({
      success: true,
      data: clonedTag,
    });
  } catch (error) {
    console.error('Ошибка клонирования тэга:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка клонирования тэга',
    });
  }
});

export default router;
