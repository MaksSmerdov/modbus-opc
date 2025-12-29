import express from 'express';
import { Port, Device } from '../../../models/settings/index.js';
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

    await Port.findByIdAndDelete(req.params.id);

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
      message: 'Порт удален',
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
