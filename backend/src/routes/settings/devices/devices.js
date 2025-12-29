import express from 'express';
import { Device, Port, Tag } from '../../../models/settings/index.js';
import { reinitializeModbus } from '../../../utils/modbusReloader.js';
import { logAudit } from '../../../utils/auditLogger.js';

const router = express.Router();

/**
 * @swagger
 * /api/config/devices:
 *   get:
 *     summary: Получить список всех устройств
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: Список устройств
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Device'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find()
      .populate('portId', 'name connectionType')
      .sort({ name: 1 })
      .lean();

    // Загружаем тэги для каждого устройства
    const devicesWithTags = await Promise.all(
      devices.map(async (device) => {
        const tags = await Tag.find({ deviceId: device._id }).lean();
        return {
          ...device,
          tags
        };
      })
    );

    res.json({
      success: true,
      count: devicesWithTags.length,
      data: devicesWithTags
    });
  } catch (error) {
    console.error('Ошибка получения устройств:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения устройств'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{id}:
 *   get:
 *     summary: Получить устройство по ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *     responses:
 *       200:
 *         description: Данные устройства
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Device'
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
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('portId')
      .lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    // Загружаем тэги устройства
    const tags = await Tag.find({ deviceId: device._id }).lean();

    res.json({
      success: true,
      data: {
        ...device,
        tags
      }
    });
  } catch (error) {
    console.error('Ошибка получения устройства:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения устройства'
    });
  }
});

/**
 * @swagger
 * /api/config/devices:
 *   post:
 *     summary: Создать новое устройство
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceInput'
 *     responses:
 *       201:
 *         description: Устройство успешно создано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       400:
 *         description: Ошибка валидации или дубликат имени
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Профиль или шаблон не найден
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
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      slaveId,
      portId,
      timeout,
      retries,
      saveInterval,
      isActive
    } = req.body;

    // Валидация
    if (!name || !slaveId || !portId) {
      return res.status(400).json({
        success: false,
        error: 'Не все обязательные поля заполнены'
      });
    }

    // Проверка существования порта
    const port = await Port.findById(portId);

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден'
      });
    }

    // Создание устройства (без тэгов - массив тэгов пустой изначально)
    // slug будет автоматически сгенерирован в pre-save hook, если не указан
    const device = await Device.create({
      name,
      slug, // Если указан - используем, иначе сгенерируется автоматически
      slaveId,
      portId,
      timeout,
      retries,
      saveInterval,
      isActive
    });

    // Получаем созданное устройство с заполненными ссылками
    const populatedDevice = await Device.findById(device._id)
      .populate('portId')
      .lean();

    // Реинициализируем Modbus для подключения нового устройства
    await reinitializeModbus();

    // Логируем создание устройства
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'create',
        entityType: 'device',
        entityName: device.name,
        fieldName: 'name',
        newValue: device.name,
        req
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...populatedDevice,
        tags: [] // Изначально массив тэгов пустой
      }
    });
  } catch (error) {
    console.error('Ошибка создания устройства:', error);

    if (error.code === 11000) {
      // Определяем какое поле вызвало ошибку уникальности
      const isSlugError = error.keyPattern?.slug;
      return res.status(400).json({
        success: false,
        error: isSlugError
          ? 'Устройство с таким API ключом (slug) уже существует'
          : 'Устройство с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания устройства'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{id}:
 *   put:
 *     summary: Обновить устройство
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceInput'
 *     responses:
 *       200:
 *         description: Устройство успешно обновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       400:
 *         description: Ошибка валидации или дубликат имени
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Устройство, профиль или шаблон не найден
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
router.put('/:id', async (req, res) => {
  try {
    // Получаем старые данные перед обновлением
    const oldDevice = await Device.findById(req.params.id).lean();

    const {
      name,
      slug,
      slaveId,
      portId,
      timeout,
      retries,
      saveInterval,
      isActive
    } = req.body;

    // Проверка существования порта (если он указан)
    if (portId) {
      const port = await Port.findById(portId);
      if (!port) {
        return res.status(404).json({
          success: false,
          error: 'Порт не найден'
        });
      }
    }

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug, // Можно обновить slug, но он должен быть уникальным
        slaveId,
        portId,
        timeout,
        retries,
        saveInterval,
        isActive
      },
      { new: true, runValidators: true }
    )
      .populate('portId')
      .lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    // Загружаем тэги устройства
    const tags = await Tag.find({ deviceId: device._id }).lean();

    // Реинициализируем Modbus для применения изменений
    await reinitializeModbus();

    // Логируем изменения
    if (req.user && oldDevice) {
      if (oldDevice.name !== device.name) {
        await logAudit({
          user: req.user,
          action: 'update',
          entityType: 'device',
          entityName: device.name,
          fieldName: 'name',
          oldValue: oldDevice.name,
          newValue: device.name,
          req
        });
      }
      if (oldDevice.slaveId !== device.slaveId) {
        await logAudit({
          user: req.user,
          action: 'update',
          entityType: 'device',
          entityName: device.name,
          fieldName: 'slaveId',
          oldValue: oldDevice.slaveId,
          newValue: device.slaveId,
          req
        });
      }
      if (oldDevice.isActive !== device.isActive) {
        await logAudit({
          user: req.user,
          action: 'toggle',
          entityType: 'device',
          entityName: device.name,
          oldValue: device.name,
          newValue: device.isActive,
          req
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...device,
        tags
      }
    });
  } catch (error) {
    console.error('Ошибка обновления устройства:', error);

    if (error.code === 11000) {
      // Определяем какое поле вызвало ошибку уникальности
      const isSlugError = error.keyPattern?.slug;
      return res.status(400).json({
        success: false,
        error: isSlugError
          ? 'Устройство с таким API ключом (slug) уже существует'
          : 'Устройство с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления устройства'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{id}:
 *   delete:
 *     summary: Удалить устройство
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *     responses:
 *       200:
 *         description: Устройство успешно удалено
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
 *                   example: Устройство удалено
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
router.delete('/:id', async (req, res) => {
  try {
    // Получаем данные устройства перед удалением
    const device = await Device.findById(req.params.id).lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    await Device.findByIdAndDelete(req.params.id);

    // Удаляем все тэги устройства
    await Tag.deleteMany({ deviceId: req.params.id });

    // Реинициализируем Modbus для удаления устройства из polling
    await reinitializeModbus();

    // Логируем удаление устройства
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'delete',
        entityType: 'device',
        entityName: device.name,
        oldValue: device.name,
        req
      });
    }

    res.json({
      success: true,
      message: 'Устройство удалено'
    });
  } catch (error) {
    console.error('Ошибка удаления устройства:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления устройства'
    });
  }
});

/**
 * @swagger
 * /api/config/devices/{id}/clone:
 *   post:
 *     summary: Клонировать устройство со всеми тэгами
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId устройства
 *     responses:
 *       201:
 *         description: Устройство успешно скопировано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Device'
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
router.post('/:id/clone', async (req, res) => {
  try {
    const sourceDevice = await Device.findById(req.params.id)
      .populate('portId')
      .lean();

    if (!sourceDevice) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    // Получаем все тэги исходного устройства
    const sourceTags = await Tag.find({ deviceId: sourceDevice._id }).lean();

    // Создаем копию устройства
    // Извлекаем базовое имя (убираем суффикс "(число)" если есть)
    const copyPattern = /^(.+) \((\d+)\)$/;
    const nameMatch = sourceDevice.name.match(copyPattern);
    const baseName = nameMatch ? nameMatch[1] : sourceDevice.name;
    
    // Находим максимальный номер среди всех копий базового имени
    const allDevices = await Device.find({}).lean();
    
    let maxNumber = 0;
    for (const device of allDevices) {
      const match = device.name.match(copyPattern);
      if (match) {
        const deviceBaseName = match[1];
        const number = parseInt(match[2], 10);
        // Проверяем, что базовое имя совпадает с исходным
        if (deviceBaseName === baseName && !isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    
    // Начинаем с максимального номера + 1
    let counter = maxNumber + 1;
    let newName = `${baseName} (${counter})`;
    
    // Дополнительная проверка на случай параллельных запросов
    while (await Device.findOne({ name: newName })) {
      counter++;
      newName = `${baseName} (${counter})`;
    }

    // Генерируем slug из исходного имени устройства и добавляем "copy"
    const generateSlug = (name) => {
      const translit = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };

      let slug = name
        .toLowerCase()
        .split('')
        .map(char => {
          const lowerChar = char.toLowerCase();
          return translit[lowerChar] || (/[a-z0-9]/.test(char) ? char : '-');
        })
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      return slug || 'device';
    };

    // Генерируем базовый slug из исходного имени устройства (без "копия")
    let baseSlug = generateSlug(sourceDevice.name);
    
    // Добавляем "copy" к slug
    let finalSlug = `${baseSlug}-copy`;
    let slugCounter = 1;

    // Проверяем уникальность slug
    while (await Device.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-copy-${slugCounter}`;
      slugCounter++;
    }

    // Получаем portId для проверки уникальности slaveId
    const portId = sourceDevice.portId._id || sourceDevice.portId;

    // Находим свободный slaveId на этом порту
    // Начинаем с slaveId исходного устройства + 1
    let newSlaveId = sourceDevice.slaveId + 1;
    const MAX_SLAVE_ID = 247;

    // Проверяем уникальность slaveId в рамках одного порта
    while (newSlaveId <= MAX_SLAVE_ID) {
      const existingDevice = await Device.findOne({
        portId: portId,
        slaveId: newSlaveId
      });

      if (!existingDevice) {
        // Нашли свободный slaveId
        break;
      }

      newSlaveId++;
    }

    // Если не нашли свободный slaveId в допустимом диапазоне
    if (newSlaveId > MAX_SLAVE_ID) {
      return res.status(400).json({
        success: false,
        error: 'Не удалось найти свободный Slave ID на этом порту (достигнут максимум 247)'
      });
    }

    const clonedDeviceData = {
      name: newName,
      slug: finalSlug,
      slaveId: newSlaveId,
      portId: portId,
      timeout: sourceDevice.timeout,
      retries: sourceDevice.retries,
      saveInterval: sourceDevice.saveInterval,
      isActive: false, // Клонированное устройство по умолчанию неактивно
    };

    const clonedDevice = await Device.create(clonedDeviceData);

    // Клонируем все тэги
    if (sourceTags.length > 0) {
      const clonedTags = sourceTags.map((tag) => ({
        deviceId: clonedDevice._id,
        address: tag.address,
        length: tag.length,
        name: tag.name,
        category: tag.category,
        functionCode: tag.functionCode,
        dataType: tag.dataType,
        bitIndex: tag.bitIndex,
        byteOrder: tag.byteOrder,
        scale: tag.scale,
        offset: tag.offset,
        decimals: tag.decimals,
        unit: tag.unit,
        minValue: tag.minValue,
        maxValue: tag.maxValue,
        description: tag.description,
      }));
      await Tag.insertMany(clonedTags);
    }

    // Получаем созданное устройство с заполненными ссылками
    const populatedDevice = await Device.findById(clonedDevice._id)
      .populate('portId')
      .lean();

    const clonedTags = await Tag.find({ deviceId: clonedDevice._id }).lean();

    // Реинициализируем Modbus
    await reinitializeModbus();

    res.status(201).json({
      success: true,
      data: {
        ...populatedDevice,
        tags: clonedTags,
      }
    });
  } catch (error) {
    console.error('Ошибка клонирования устройства:', error);

    if (error.code === 11000) {
      const isSlugError = error.keyPattern?.slug;
      return res.status(400).json({
        success: false,
        error: isSlugError
          ? 'Устройство с таким API ключом (slug) уже существует'
          : 'Устройство с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка клонирования устройства'
    });
  }
});

export default router;

