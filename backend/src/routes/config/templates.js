import express from 'express';
import { RegisterTemplate, Device } from '../../models/config/index.js';

const router = express.Router();

/**
 * GET /api/config/templates
 * Получить все шаблоны регистров
 */
router.get('/', async (req, res) => {
  try {
    const { deviceType } = req.query;
    
    const query = deviceType ? { deviceType } : {};
    
    const templates = await RegisterTemplate.find(query)
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения шаблонов'
    });
  }
});

/**
 * GET /api/config/templates/:id
 * Получить шаблон по ID
 */
router.get('/:id', async (req, res) => {
  try {
    const template = await RegisterTemplate.findById(req.params.id).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Шаблон не найден'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Ошибка получения шаблона:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения шаблона'
    });
  }
});

/**
 * POST /api/config/templates
 * Создать новый шаблон регистров
 */
router.post('/', async (req, res) => {
  try {
    const { name, deviceType, registers } = req.body;

    // Валидация
    if (!name || !deviceType || !registers || !Array.isArray(registers)) {
      return res.status(400).json({
        success: false,
        error: 'Не все обязательные поля заполнены'
      });
    }

    if (registers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Шаблон должен содержать хотя бы один регистр'
      });
    }

    // Валидация каждого регистра
    for (const reg of registers) {
      if (!reg.address && reg.address !== 0) {
        return res.status(400).json({
          success: false,
          error: 'Каждый регистр должен иметь адрес'
        });
      }
      if (!reg.length) {
        return res.status(400).json({
          success: false,
          error: 'Каждый регистр должен иметь длину'
        });
      }
      if (!reg.name) {
        return res.status(400).json({
          success: false,
          error: 'Каждый регистр должен иметь название'
        });
      }
      if (!reg.dataType) {
        return res.status(400).json({
          success: false,
          error: 'Каждый регистр должен иметь тип данных'
        });
      }
    }

    const template = await RegisterTemplate.create({
      name,
      deviceType,
      registers
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Ошибка создания шаблона:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Шаблон с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания шаблона'
    });
  }
});

/**
 * PUT /api/config/templates/:id
 * Обновить шаблон регистров
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, deviceType, registers } = req.body;

    // Валидация registers если они есть
    if (registers) {
      if (!Array.isArray(registers)) {
        return res.status(400).json({
          success: false,
          error: 'Регистры должны быть массивом'
        });
      }

      if (registers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Шаблон должен содержать хотя бы один регистр'
        });
      }
    }

    const template = await RegisterTemplate.findByIdAndUpdate(
      req.params.id,
      { name, deviceType, registers },
      { new: true, runValidators: true }
    ).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Шаблон не найден'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Ошибка обновления шаблона:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Шаблон с таким именем уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления шаблона'
    });
  }
});

/**
 * DELETE /api/config/templates/:id
 * Удалить шаблон регистров
 */
router.delete('/:id', async (req, res) => {
  try {
    // Проверяем, используется ли шаблон какими-либо устройствами
    const devicesUsingTemplate = await Device.countDocuments({
      registerTemplateId: req.params.id
    });

    if (devicesUsingTemplate > 0) {
      return res.status(400).json({
        success: false,
        error: `Шаблон используется ${devicesUsingTemplate} устройством(и). Удаление невозможно.`
      });
    }

    const template = await RegisterTemplate.findByIdAndDelete(req.params.id).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Шаблон не найден'
      });
    }

    res.json({
      success: true,
      message: 'Шаблон удален'
    });
  } catch (error) {
    console.error('Ошибка удаления шаблона:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления шаблона'
    });
  }
});

export default router;

