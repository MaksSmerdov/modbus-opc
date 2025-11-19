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
 * Использует wmic вместо PowerShell для большей надежности
 * @returns {Promise<Array<{name: string, description?: string}>>}
 */
async function getWindowsCOMPortsWMI() {
  try {
    // Используем wmic для получения всех COM-портов
    const command = `wmic path Win32_SerialPort get DeviceID,Name /format:csv`;
    const { stdout } = await execAsync(command, { encoding: 'utf8' });

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    // Парсим CSV формат wmic
    const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
    const ports = [];

    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const deviceId = parts[parts.length - 2]?.trim();
        const name = parts[parts.length - 1]?.trim();
        if (deviceId && deviceId.startsWith('COM')) {
          ports.push({
            name: deviceId,
            description: name || null
          });
        }
      }
    }

    return ports;
  } catch (error) {
    console.error('Ошибка получения COM-портов через WMI (wmic):', error.message);
    return [];
  }
}

/**
 * Получает COM-порты из реестра Windows (самый надежный метод для виртуальных портов)
 * @returns {Promise<Array<{name: string}>>}
 */
async function getWindowsCOMPortsFromRegistry() {
  try {
    // Читаем реестр Windows через reg query
    const command = `reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DEVICEMAP\\SERIALCOMM"`;
    const { stdout } = await execAsync(command, { encoding: 'utf8' });

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    const ports = [];
    const lines = stdout.split('\n');

    for (const line of lines) {
      // Формат: "    \\Device\\Serial0    REG_SZ    COM1"
      const match = line.match(/COM\d+/i);
      if (match) {
        ports.push({
          name: match[0].toUpperCase()
        });
      }
    }

    return ports;
  } catch (error) {
    console.error('Ошибка получения COM-портов из реестра:', error.message);
    return [];
  }
}

/**
 * Получает все COM-порты из Windows через WMI (включая виртуальные)
 * Пробует несколько методов для максимального покрытия
 * @returns {Promise<Array<{name: string, description?: string}>>}
 */
async function getWindowsCOMPorts() {
  // Пробуем несколько методов и объединяем результаты
  const [wmiPorts, registryPorts] = await Promise.all([
    getWindowsCOMPortsWMI(),
    getWindowsCOMPortsFromRegistry()
  ]);

  // Объединяем результаты, убирая дубликаты
  const portsMap = new Map();

  // Добавляем порты из WMI (с описанием)
  wmiPorts.forEach(port => {
    portsMap.set(port.name, port);
  });

  // Добавляем порты из реестра (если их еще нет)
  registryPorts.forEach(port => {
    if (!portsMap.has(port.name)) {
      portsMap.set(port.name, port);
    }
  });

  const allPorts = Array.from(portsMap.values());

  return allPorts;
}

/**
 * Получает все доступные COM-порты из Windows
 * Использует WMI и реестр для максимального покрытия (включая виртуальные порты)
 * Фильтрует скрытые порты для не-админов
 * @param {string} userRole - Роль пользователя ('admin', 'operator', 'viewer')
 * @returns {Promise<Array<{name: string, manufacturer: string | null, ...}>>}
 */
async function getAllAvailablePorts(userRole = 'viewer') {
  // Получаем все COM-порты из Windows (включая виртуальные)
  const windowsPorts = await getWindowsCOMPorts();

  // Получаем настройки портов из БД
  const { AvailablePort } = await import('../../../models/settings/index.js');
  const portSettings = await AvailablePort.find().lean();
  const settingsMap = new Map(portSettings.map(s => [s.portName, s]));

  // Форматируем порты с учетом настроек
  const formattedPorts = windowsPorts
    .map(winPort => {
      const settings = settingsMap.get(winPort.name);
      return {
        name: winPort.name,
        manufacturer: null,
        serialNumber: null,
        pnpId: null,
        vendorId: null,
        productId: null,
        locationId: null,
        description: settings?.description || winPort.description || null
      };
    })
    // Фильтруем скрытые порты для не-админов
    .filter(port => {
      const settings = settingsMap.get(port.name);
      return userRole === 'admin' || !settings?.isHidden;
    });

  console.log(`Итого доступно портов: ${formattedPorts.length}`, formattedPorts.map(p => p.name));

  return formattedPorts;
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
    const userRole = req.user?.role || 'viewer';
    const ports = await getAllAvailablePorts(userRole);

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

