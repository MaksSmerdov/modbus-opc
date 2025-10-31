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
 * GET /api/config/profiles
 * Получить все профили подключений
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
 * GET /api/config/profiles/:id
 * Получить профиль по ID
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
 * POST /api/config/profiles
 * Создать новый профиль подключения
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
 * PUT /api/config/profiles/:id
 * Обновить профиль подключения
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
 * DELETE /api/config/profiles/:id
 * Удалить профиль подключения
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

