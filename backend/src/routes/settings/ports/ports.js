import express from 'express';
import { Port, Device, Tag } from '../../../models/settings/index.js';
import { reinitializeModbus } from '../../../utils/modbusReloader.js';
import { logAudit } from '../../../utils/auditLogger.js';

const router = express.Router();

/**
 * Форматирует порт для ответа - оставляет только релевантные поля
 */
function formatPort(port) {
  const base = {
    _id: port._id,
    name: port.name,
    connectionType: port.connectionType,
    isActive: port.isActive ?? true,
    createdAt: port.createdAt,
    updatedAt: port.updatedAt,
  };

  if (port.connectionType === 'RTU') {
    return {
      ...base,
      port: port.port,
      baudRate: port.baudRate,
      dataBits: port.dataBits,
      stopBits: port.stopBits,
      parity: port.parity,
    };
  } else if (port.connectionType === 'TCP' || port.connectionType === 'TCP_RTU') {
    return {
      ...base,
      host: port.host,
      tcpPort: port.tcpPort,
    };
  }

  return base;
}

/**
 * @swagger
 * /api/config/ports:
 *   get:
 *     summary: Получить список всех портов
 *     tags: [Ports]
 *     responses:
 *       200:
 *         description: Список портов
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Port'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const ports = await Port.find().sort({ name: 1 }).lean();

    const formattedPorts = ports.map(formatPort);

    res.json({
      success: true,
      count: formattedPorts.length,
      data: formattedPorts,
    });
  } catch (error) {
    console.error('Ошибка получения портов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения портов',
    });
  }
});

/**
 * @swagger
 * /api/config/ports/{id}:
 *   get:
 *     summary: Получить порт по ID
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId порта
 *     responses:
 *       200:
 *         description: Данные порта
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Port'
 *       404:
 *         description: Порт не найден
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
    const port = await Port.findById(req.params.id).lean();

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден',
      });
    }

    res.json({
      success: true,
      data: formatPort(port),
    });
  } catch (error) {
    console.error('Ошибка получения порта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения порта',
    });
  }
});

/**
 * @swagger
 * /api/config/ports:
 *   post:
 *     summary: Создать новый порт подключения
 *     tags: [Ports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/PortRTU'
 *               - $ref: '#/components/schemas/PortTCP'
 *     responses:
 *       201:
 *         description: Порт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Port'
 *       400:
 *         description: Ошибка валидации или дубликат имени
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
    const portData = req.body;

    // Базовая валидация
    if (!portData.name || !portData.connectionType) {
      return res.status(400).json({
        success: false,
        error: 'Не все обязательные поля заполнены',
      });
    }

    // Валидация в зависимости от типа
    if (portData.connectionType === 'RTU') {
      if (!portData.port || !portData.baudRate) {
        return res.status(400).json({
          success: false,
          error: 'Для RTU необходимо указать порт и скорость',
        });
      }
    } else if (portData.connectionType === 'TCP' || portData.connectionType === 'TCP_RTU') {
      if (!portData.host || !portData.tcpPort) {
        return res.status(400).json({
          success: false,
          error: 'Для TCP/TCP_RTU необходимо указать хост и TCP порт',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Некорректный тип подключения',
      });
    }

    const port = await Port.create(portData);

    // Логируем создание порта
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'create',
        entityType: 'port',
        entityName: port.name,
        fieldName: 'name',
        newValue: port.name,
        req,
      });
    }

    res.status(201).json({
      success: true,
      data: formatPort(port.toObject()),
    });
  } catch (error) {
    console.error('Ошибка создания порта:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Порт с таким именем уже существует',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания порта',
    });
  }
});

/**
 * @swagger
 * /api/config/ports/{id}:
 *   put:
 *     summary: Обновить порт подключения
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId порта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/PortRTU'
 *               - $ref: '#/components/schemas/PortTCP'
 *     responses:
 *       200:
 *         description: Порт успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Port'
 *       400:
 *         description: Ошибка валидации или дубликат имени
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Порт не найден
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
    const portData = req.body;

    // Проверяем, изменился ли isActive
    const oldPort = await Port.findById(req.params.id).lean();
    const isActiveChanged = oldPort && 'isActive' in portData && oldPort.isActive !== portData.isActive;

    const port = await Port.findByIdAndUpdate(req.params.id, portData, { new: true, runValidators: true }).lean();

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден',
      });
    }

    // Реинициализируем Modbus, если изменился isActive или другие критичные параметры
    const criticalParamsChanged =
      isActiveChanged ||
      portData.connectionType !== oldPort?.connectionType ||
      (port.connectionType === 'RTU' && (portData.port !== oldPort?.port || portData.baudRate !== oldPort?.baudRate)) ||
      ((port.connectionType === 'TCP' || port.connectionType === 'TCP_RTU') &&
        (portData.host !== oldPort?.host || portData.tcpPort !== oldPort?.tcpPort));

    if (criticalParamsChanged) {
      await reinitializeModbus();
    }

    // Логируем изменения
    if (req.user && oldPort) {
      if (oldPort.name !== port.name) {
        await logAudit({
          user: req.user,
          action: 'update',
          entityType: 'port',
          entityName: port.name,
          fieldName: 'name',
          oldValue: oldPort.name,
          newValue: port.name,
          req,
        });
      }
      if (isActiveChanged) {
        await logAudit({
          user: req.user,
          action: 'toggle',
          entityType: 'port',
          entityName: port.name,
          oldValue: port.name,
          newValue: port.isActive,
          req,
        });
      }
    }

    res.json({
      success: true,
      data: formatPort(port),
    });
  } catch (error) {
    console.error('Ошибка обновления порта:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Порт с таким именем уже существует',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления порта',
    });
  }
});

/**
 * @swagger
 * /api/config/ports/{id}:
 *   delete:
 *     summary: Удалить порт подключения
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId порта
 *     responses:
 *       200:
 *         description: Порт успешно удален
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
 *                   example: Порт удален
 *       400:
 *         description: Порт используется устройствами
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Порт не найден
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
    // Получаем данные порта перед удалением
    const port = await Port.findById(req.params.id).lean();

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден',
      });
    }

    // Находим все устройства, связанные с этим портом
    const devices = await Device.find({ portId: req.params.id }).lean();

    // Удаляем все теги для каждого устройства
    let deletedTagsCount = 0;
    for (const device of devices) {
      const tags = await Tag.find({ deviceId: device._id }).lean();
      if (tags.length > 0) {
        await Tag.deleteMany({ deviceId: device._id });
        deletedTagsCount += tags.length;

        // Логируем удаление тегов
        if (req.user) {
          await logAudit({
            user: req.user,
            action: 'delete',
            entityType: 'tag',
            entityName: `Теги устройства ${device.name}`,
            oldValue: `Удалено ${tags.length} тегов`,
            req,
          });
        }
      }
    }

    // Удаляем все устройства
    if (devices.length > 0) {
      await Device.deleteMany({ portId: req.params.id });

      // Логируем удаление устройств
      if (req.user) {
        await logAudit({
          user: req.user,
          action: 'delete',
          entityType: 'device',
          entityName: `Устройства порта ${port.name}`,
          oldValue: `Удалено ${devices.length} устройств`,
          req,
        });
      }
    }

    // Удаляем порт
    await Port.findByIdAndDelete(req.params.id);

    // Реинициализируем Modbus после удаления порта и связанных устройств
    await reinitializeModbus();

    // Логируем удаление порта
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'delete',
        entityType: 'port',
        entityName: port.name,
        oldValue: port.name,
        req,
      });
    }

    res.json({
      success: true,
      message: `Порт удален. Удалено устройств: ${devices.length}, тегов: ${deletedTagsCount}`,
    });
  } catch (error) {
    console.error('Ошибка удаления порта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления порта',
    });
  }
});

/**
 * @swagger
 * /api/config/ports/{id}/clone:
 *   post:
 *     summary: Клонировать порт подключения
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId порта
 *     responses:
 *       201:
 *         description: Порт успешно скопирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Port'
 *       404:
 *         description: Порт не найден
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
    const sourcePort = await Port.findById(req.params.id).lean();

    if (!sourcePort) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден',
      });
    }

    // Создаем копию порта с новым именем
    const clonedData = {
      connectionType: sourcePort.connectionType,
      isActive: false, // Клонированный порт по умолчанию неактивен
    };

    // Копируем параметры в зависимости от типа подключения
    if (sourcePort.connectionType === 'RTU') {
      clonedData.port = sourcePort.port;
      clonedData.baudRate = sourcePort.baudRate;
      clonedData.dataBits = sourcePort.dataBits;
      clonedData.stopBits = sourcePort.stopBits;
      clonedData.parity = sourcePort.parity;
    } else if (sourcePort.connectionType === 'TCP' || sourcePort.connectionType === 'TCP_RTU') {
      clonedData.host = sourcePort.host;
      clonedData.tcpPort = sourcePort.tcpPort;
    }

    // Извлекаем базовое имя (убираем суффикс "(число)" если есть)
    const copyPattern = /^(.+) \((\d+)\)$/;
    const nameMatch = sourcePort.name.match(copyPattern);
    const baseName = nameMatch ? nameMatch[1] : sourcePort.name;
    
    // Находим максимальный номер среди всех копий базового имени
    const allPorts = await Port.find({}).lean();
    
    let maxNumber = 0;
    for (const port of allPorts) {
      const match = port.name.match(copyPattern);
      if (match) {
        const portBaseName = match[1];
        const number = parseInt(match[2], 10);
        // Проверяем, что базовое имя совпадает с исходным
        if (portBaseName === baseName && !isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    
    // Начинаем с максимального номера + 1
    let counter = maxNumber + 1;
    let newName = `${baseName} (${counter})`;
    
    // Дополнительная проверка на случай параллельных запросов
    while (await Port.findOne({ name: newName })) {
      counter++;
      newName = `${baseName} (${counter})`;
    }
    clonedData.name = newName;

    const clonedPort = await Port.create(clonedData);

    // Получаем все устройства исходного порта
    const sourceDevices = await Device.find({ portId: sourcePort._id }).lean();

    // Клонируем каждое устройство и его теги
    for (const sourceDevice of sourceDevices) {
      // Получаем все теги исходного устройства
      const sourceTags = await Tag.find({ deviceId: sourceDevice._id }).lean();

      // Генерируем имя для клонированного устройства
      const deviceNameMatch = sourceDevice.name.match(copyPattern);
      const deviceBaseName = deviceNameMatch ? deviceNameMatch[1] : sourceDevice.name;
      
      // Находим максимальный номер среди всех копий базового имени устройства
      const allDevices = await Device.find({}).lean();
      
      let deviceMaxNumber = 0;
      for (const device of allDevices) {
        const match = device.name.match(copyPattern);
        if (match) {
          const deviceBaseNameMatch = match[1];
          const number = parseInt(match[2], 10);
          if (deviceBaseNameMatch === deviceBaseName && !isNaN(number) && number > deviceMaxNumber) {
            deviceMaxNumber = number;
          }
        }
      }
      
      let deviceCounter = deviceMaxNumber + 1;
      let newDeviceName = `${deviceBaseName} (${deviceCounter})`;
      
      while (await Device.findOne({ name: newDeviceName })) {
        deviceCounter++;
        newDeviceName = `${deviceBaseName} (${deviceCounter})`;
      }

      // Генерируем slug для устройства
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

      let baseSlug = generateSlug(sourceDevice.name);
      let finalSlug = `${baseSlug}-copy`;
      let slugCounter = 1;

      while (await Device.findOne({ slug: finalSlug })) {
        finalSlug = `${baseSlug}-copy-${slugCounter}`;
        slugCounter++;
      }

      // Находим свободный slaveId на новом порту
      let newSlaveId = sourceDevice.slaveId;
      const MAX_SLAVE_ID = 247;

      // Проверяем уникальность slaveId в рамках нового порта
      while (newSlaveId <= MAX_SLAVE_ID) {
        const existingDevice = await Device.findOne({
          portId: clonedPort._id,
          slaveId: newSlaveId
        });

        if (!existingDevice) {
          break;
        }

        newSlaveId++;
      }

      // Если не нашли свободный slaveId, пропускаем это устройство
      if (newSlaveId > MAX_SLAVE_ID) {
        console.warn(`Не удалось найти свободный Slave ID для устройства ${sourceDevice.name} на порту ${clonedPort.name}`);
        continue;
      }

      // Создаем клонированное устройство
      const clonedDeviceData = {
        name: newDeviceName,
        slug: finalSlug,
        slaveId: newSlaveId,
        portId: clonedPort._id,
        timeout: sourceDevice.timeout,
        retries: sourceDevice.retries,
        saveInterval: sourceDevice.saveInterval,
        isActive: false, // Клонированное устройство по умолчанию неактивно
      };

      const clonedDevice = await Device.create(clonedDeviceData);

      // Клонируем все теги устройства
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
          compositeDisplay: tag.compositeDisplay,
          order: tag.order,
        }));
        await Tag.insertMany(clonedTags);
      }
    }

    // Реинициализируем Modbus после клонирования
    await reinitializeModbus();

    res.status(201).json({
      success: true,
      data: formatPort(clonedPort.toObject()),
    });
  } catch (error) {
    console.error('Ошибка клонирования порта:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Порт с таким именем уже существует',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка клонирования порта',
    });
  }
});

export default router;
