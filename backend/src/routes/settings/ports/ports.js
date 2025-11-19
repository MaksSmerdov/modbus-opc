import { SerialPort } from 'serialport';
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Port, Device } from '../../../models/index.js';
import { reinitializeModbus } from '../../../utils/modbusReloader.js';
import { logAudit } from '../../../utils/auditLogger.js';

const router = express.Router();

const execAsync = promisify(exec);

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
    updatedAt: port.updatedAt
  };

  if (port.connectionType === 'RTU') {
    return {
      ...base,
      port: port.port,
      baudRate: port.baudRate,
      dataBits: port.dataBits,
      stopBits: port.stopBits,
      parity: port.parity
    };
  } else if (port.connectionType === 'TCP') {
    return {
      ...base,
      host: port.host,
      tcpPort: port.tcpPort
    };
  }

  return base;
}

/**
 * Получает все COM-порты из Windows через WMI (включая виртуальные)
 * @returns {Promise<Array<{name: string, description?: string}>>}
 */
async function getWindowsCOMPorts() {
  try {
    // Используем PowerShell для получения всех COM-портов через WMI
    const command = `powershell -Command "Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Name | ConvertTo-Json"`;
    const { stdout } = await execAsync(command, { encoding: 'utf8' });

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    // PowerShell может вернуть массив или один объект
    const ports = JSON.parse(stdout);
    const portsArray = Array.isArray(ports) ? ports : [ports];

    return portsArray.map(port => ({
      name: port.DeviceID || null,
      description: port.Name || null
    })).filter(port => port.name && port.name.startsWith('COM'));
  } catch (error) {
    console.error('Ошибка получения COM-портов через WMI:', error);
    return [];
  }
}

/**
 * Объединяет порты из SerialPort.list() и Windows WMI, убирая дубликаты
 */
async function getAllAvailablePorts() {
  // Получаем порты через serialport (физические порты с метаданными)
  const serialPorts = await SerialPort.list();
  const serialPortsMap = new Map();

  serialPorts.forEach(p => {
    serialPortsMap.set(p.path, {
      name: p.path,
      manufacturer: p.manufacturer || null,
      serialNumber: p.serialNumber || null,
      pnpId: p.pnpId || null,
      vendorId: p.vendorId || null,
      productId: p.productId || null,
      locationId: p.locationId || null
    });
  });

  // Получаем все COM-порты из Windows (включая виртуальные)
  const windowsPorts = await getWindowsCOMPorts();

  // Добавляем виртуальные порты, которых нет в serialport
  windowsPorts.forEach(winPort => {
    if (!serialPortsMap.has(winPort.name)) {
      serialPortsMap.set(winPort.name, {
        name: winPort.name,
        manufacturer: null,
        serialNumber: null,
        pnpId: null,
        vendorId: null,
        productId: null,
        locationId: null,
        description: winPort.description || null
      });
    }
  });

  return Array.from(serialPortsMap.values());
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
    const ports = await Port.find()
      .sort({ name: 1 })
      .lean();

    const formattedPorts = ports.map(formatPort);

    res.json({
      success: true,
      count: formattedPorts.length,
      data: formattedPorts
    });
  } catch (error) {
    console.error('Ошибка получения портов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения портов'
    });
  }
});

/**
 * @swagger
 * /api/config/ports/available:
 *   get:
 *     summary: Получить список доступных COM-портов системы
 *     tags: [Ports]
 *     description: Возвращает список всех доступных последовательных портов (COM-портов) на системе
 *     responses:
 *       200:
 *         description: Список доступных COM-портов
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
 *                   description: Количество доступных портов
 *                   example: 3
 *                 data:
 *                   type: array
 *                   description: Массив доступных портов
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Путь к порту (например, COM1, /dev/ttyUSB0)
 *                         example: COM3
 *       500:
 *         description: Ошибка получения списка портов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/available', async (req, res) => {
  try {
    const ports = await getAllAvailablePorts();

    res.json({
      success: true,
      count: ports.length,
      data: ports
    });
  } catch (e) {
    console.error('Ошибка получения доступных портов:', e);
    res.status(500).json({
      success: false,
      error: e.message || 'Ошибка получения списка доступных портов'
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
        error: 'Порт не найден'
      });
    }

    res.json({
      success: true,
      data: formatPort(port)
    });
  } catch (error) {
    console.error('Ошибка получения порта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения порта'
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
        error: 'Не все обязательные поля заполнены'
      });
    }

    // Валидация в зависимости от типа
    if (portData.connectionType === 'RTU') {
      if (!portData.port || !portData.baudRate) {
        return res.status(400).json({
          success: false,
          error: 'Для RTU необходимо указать порт и скорость'
        });
      }
    } else if (portData.connectionType === 'TCP') {
      if (!portData.host) {
        return res.status(400).json({
          success: false,
          error: 'Для TCP необходимо указать хост'
        });
      }
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
        req
      });
    }

    res.status(201).json({
      success: true,
      data: formatPort(port.toObject())
    });
  } catch (error) {
    console.error('Ошибка создания порта:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Порт с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания порта'
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

    const port = await Port.findByIdAndUpdate(
      req.params.id,
      portData,
      { new: true, runValidators: true }
    ).lean();

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден'
      });
    }

    // Реинициализируем Modbus, если изменился isActive или другие критичные параметры
    const criticalParamsChanged = isActiveChanged ||
      portData.connectionType !== oldPort?.connectionType ||
      (port.connectionType === 'RTU' && (portData.port !== oldPort?.port || portData.baudRate !== oldPort?.baudRate)) ||
      (port.connectionType === 'TCP' && (portData.host !== oldPort?.host || portData.tcpPort !== oldPort?.tcpPort));

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
          req
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
          req
        });
      }
    }

    res.json({
      success: true,
      data: formatPort(port)
    });
  } catch (error) {
    console.error('Ошибка обновления порта:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Порт с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления порта'
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
    // Проверяем, используется ли порт какими-либо устройствами
    const devicesUsingProfile = await Device.countDocuments({
      portId: req.params.id
    });

    if (devicesUsingProfile > 0) {
      return res.status(400).json({
        success: false,
        error: `Порт используется ${devicesUsingProfile} устройством(и). Удаление невозможно.`
      });
    }

    // Получаем данные порта перед удалением
    const port = await Port.findById(req.params.id).lean();

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден'
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
        req
      });
    }

    res.json({
      success: true,
      message: 'Порт удален'
    });
  } catch (error) {
    console.error('Ошибка удаления порта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления порта'
    });
  }
});

export default router;

