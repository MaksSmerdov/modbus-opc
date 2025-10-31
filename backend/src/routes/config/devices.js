import express from 'express';
import { Device, ConnectionProfile, RegisterTemplate } from '../../models/config/index.js';

const router = express.Router();

/**
 * GET /api/config/devices
 * Получить все устройства
 */
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find()
      .populate('connectionProfileId', 'name connectionType')
      .populate('registerTemplateId', 'name deviceType')
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      count: devices.length,
      data: devices
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
 * GET /api/config/devices/:id
 * Получить устройство по ID
 */
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('connectionProfileId')
      .populate('registerTemplateId')
      .lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    res.json({
      success: true,
      data: device
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
 * POST /api/config/devices
 * Создать новое устройство
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slaveId,
      connectionProfileId,
      registerTemplateId,
      saveInterval,
      logData,
      isActive
    } = req.body;

    // Валидация
    if (!name || !slaveId || !connectionProfileId || !registerTemplateId) {
      return res.status(400).json({
        success: false,
        error: 'Не все обязательные поля заполнены'
      });
    }

    // Проверка существования профиля и шаблона
    const profile = await ConnectionProfile.findById(connectionProfileId);
    const template = await RegisterTemplate.findById(registerTemplateId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Профиль подключения не найден'
      });
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Шаблон регистров не найден'
      });
    }

    // Создание устройства
    const device = await Device.create({
      name,
      slaveId,
      connectionProfileId,
      registerTemplateId,
      saveInterval,
      logData,
      isActive
    });

    // Получаем созданное устройство с заполненными ссылками
    const populatedDevice = await Device.findById(device._id)
      .populate('connectionProfileId')
      .populate('registerTemplateId')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedDevice
    });
  } catch (error) {
    console.error('Ошибка создания устройства:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Устройство с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания устройства'
    });
  }
});

/**
 * PUT /api/config/devices/:id
 * Обновить устройство
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      slaveId,
      connectionProfileId,
      registerTemplateId,
      saveInterval,
      logData,
      isActive
    } = req.body;

    // Проверка существования профиля и шаблона (если они указаны)
    if (connectionProfileId) {
      const profile = await ConnectionProfile.findById(connectionProfileId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Профиль подключения не найден'
        });
      }
    }

    if (registerTemplateId) {
      const template = await RegisterTemplate.findById(registerTemplateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Шаблон регистров не найден'
        });
      }
    }

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slaveId,
        connectionProfileId,
        registerTemplateId,
        saveInterval,
        logData,
        isActive
      },
      { new: true, runValidators: true }
    )
      .populate('connectionProfileId')
      .populate('registerTemplateId')
      .lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Ошибка обновления устройства:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Устройство с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления устройства'
    });
  }
});

/**
 * DELETE /api/config/devices/:id
 * Удалить устройство
 */
router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id).lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Устройство не найдено'
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

export default router;

