import express from 'express';
import { Port, Device } from '../../models/config/index.js';

const router = express.Router();

/**
 * Форматирует порт для ответа - оставляет только релевантные поля
 */
function formatPort(port) {
  const base = {
    _id: port._id,
    name: port.name,
    connectionType: port.connectionType,
    timeout: port.timeout,
    retries: port.retries,
    isActive: port.isActive ?? true, // Дефолт для старых портов
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

    const port = await Port.findByIdAndDelete(req.params.id).lean();

    if (!port) {
      return res.status(404).json({
        success: false,
        error: 'Порт не найден'
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

