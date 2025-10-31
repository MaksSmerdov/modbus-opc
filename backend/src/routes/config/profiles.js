import express from 'express';
import { ConnectionProfile, Device } from '../../models/config/index.js';

const router = express.Router();

/**
 * Форматирует профиль для ответа - оставляет только релевантные поля
 */
function formatProfile(profile) {
  const base = {
    _id: profile._id,
    name: profile.name,
    connectionType: profile.connectionType,
    timeout: profile.timeout,
    retries: profile.retries,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };

  if (profile.connectionType === 'RTU') {
    return {
      ...base,
      port: profile.port,
      baudRate: profile.baudRate,
      dataBits: profile.dataBits,
      stopBits: profile.stopBits,
      parity: profile.parity
    };
  } else if (profile.connectionType === 'TCP') {
    return {
      ...base,
      host: profile.host,
      tcpPort: profile.tcpPort
    };
  }

  return base;
}

/**
 * @swagger
 * /api/config/profiles:
 *   get:
 *     summary: Получить список всех профилей подключений
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Список профилей
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
 *                     $ref: '#/components/schemas/ConnectionProfile'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const profiles = await ConnectionProfile.find()
      .sort({ name: 1 })
      .lean();

    const formattedProfiles = profiles.map(formatProfile);

    res.json({
      success: true,
      count: formattedProfiles.length,
      data: formattedProfiles
    });
  } catch (error) {
    console.error('Ошибка получения профилей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения профилей'
    });
  }
});

/**
 * @swagger
 * /api/config/profiles/{id}:
 *   get:
 *     summary: Получить профиль по ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId профиля
 *     responses:
 *       200:
 *         description: Данные профиля
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConnectionProfile'
 *       404:
 *         description: Профиль не найден
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
    const profile = await ConnectionProfile.findById(req.params.id).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Профиль не найден'
      });
    }

    res.json({
      success: true,
      data: formatProfile(profile)
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения профиля'
    });
  }
});

/**
 * @swagger
 * /api/config/profiles:
 *   post:
 *     summary: Создать новый профиль подключения
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/ConnectionProfileRTU'
 *               - $ref: '#/components/schemas/ConnectionProfileTCP'
 *     responses:
 *       201:
 *         description: Профиль успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConnectionProfile'
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
    const profileData = req.body;

    // Базовая валидация
    if (!profileData.name || !profileData.connectionType) {
      return res.status(400).json({
        success: false,
        error: 'Не все обязательные поля заполнены'
      });
    }

    // Валидация в зависимости от типа
    if (profileData.connectionType === 'RTU') {
      if (!profileData.port || !profileData.baudRate) {
        return res.status(400).json({
          success: false,
          error: 'Для RTU необходимо указать порт и скорость'
        });
      }
    } else if (profileData.connectionType === 'TCP') {
      if (!profileData.host) {
        return res.status(400).json({
          success: false,
          error: 'Для TCP необходимо указать хост'
        });
      }
    }

    const profile = await ConnectionProfile.create(profileData);

    res.status(201).json({
      success: true,
      data: formatProfile(profile.toObject())
    });
  } catch (error) {
    console.error('Ошибка создания профиля:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Профиль с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания профиля'
    });
  }
});

/**
 * @swagger
 * /api/config/profiles/{id}:
 *   put:
 *     summary: Обновить профиль подключения
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId профиля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/ConnectionProfileRTU'
 *               - $ref: '#/components/schemas/ConnectionProfileTCP'
 *     responses:
 *       200:
 *         description: Профиль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConnectionProfile'
 *       400:
 *         description: Ошибка валидации или дубликат имени
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Профиль не найден
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
    const profileData = req.body;

    const profile = await ConnectionProfile.findByIdAndUpdate(
      req.params.id,
      profileData,
      { new: true, runValidators: true }
    ).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Профиль не найден'
      });
    }

    res.json({
      success: true,
      data: formatProfile(profile)
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Профиль с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления профиля'
    });
  }
});

/**
 * @swagger
 * /api/config/profiles/{id}:
 *   delete:
 *     summary: Удалить профиль подключения
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId профиля
 *     responses:
 *       200:
 *         description: Профиль успешно удален
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
 *                   example: Профиль удален
 *       400:
 *         description: Профиль используется устройствами
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Профиль не найден
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
    // Проверяем, используется ли профиль какими-либо устройствами
    const devicesUsingProfile = await Device.countDocuments({
      connectionProfileId: req.params.id
    });

    if (devicesUsingProfile > 0) {
      return res.status(400).json({
        success: false,
        error: `Профиль используется ${devicesUsingProfile} устройством(и). Удаление невозможно.`
      });
    }

    const profile = await ConnectionProfile.findByIdAndDelete(req.params.id).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Профиль не найден'
      });
    }

    res.json({
      success: true,
      message: 'Профиль удален'
    });
  } catch (error) {
    console.error('Ошибка удаления профиля:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления профиля'
    });
  }
});

export default router;

