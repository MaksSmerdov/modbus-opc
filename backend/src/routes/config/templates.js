import express from 'express';
import { RegisterTemplate, Device } from '../../models/config/index.js';
import { reinitializeModbus } from '../../utils/modbusReloader.js';

const router = express.Router();

/**
 * @swagger
 * /api/config/templates:
 *   get:
 *     summary: Получить список всех шаблонов регистров
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: deviceType
 *         schema:
 *           type: string
 *         description: Фильтр по типу устройства
 *     responses:
 *       200:
 *         description: Список шаблонов
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
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RegisterTemplate'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/config/templates/{id}:
 *   get:
 *     summary: Получить шаблон по ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId шаблона
 *     responses:
 *       200:
 *         description: Данные шаблона
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RegisterTemplate'
 *       404:
 *         description: Шаблон не найден
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
 * @swagger
 * /api/config/templates:
 *   post:
 *     summary: Создать новый шаблон регистров
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, deviceType, registers]
 *             properties:
 *               name:
 *                 type: string
 *                 example: BoilerTemplate
 *               deviceType:
 *                 type: string
 *                 example: boiler
 *               registers:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: Шаблон успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RegisterTemplate'
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
 * @swagger
 * /api/config/templates/{id}:
 *   put:
 *     summary: Обновить шаблон регистров
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId шаблона
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: BoilerTemplate
 *               deviceType:
 *                 type: string
 *                 example: boiler
 *               registers:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/Register'
 *     responses:
 *       200:
 *         description: Шаблон успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RegisterTemplate'
 *       400:
 *         description: Ошибка валидации или дубликат имени
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Шаблон не найден
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
 * @swagger
 * /api/config/templates/{id}/registers/{registerIndex}:
 *   patch:
 *     summary: Обновить конкретный регистр в шаблоне
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId шаблона
 *       - in: path
 *         name: registerIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Индекс регистра в массиве
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Частичные данные регистра для обновления
 *             properties:
 *               address:
 *                 type: integer
 *                 example: 0
 *               length:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Temperature
 *               dataType:
 *                 type: string
 *                 example: float
 *     responses:
 *       200:
 *         description: Регистр успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RegisterTemplate'
 *       400:
 *         description: Некорректный индекс регистра
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Шаблон не найден
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
router.patch('/:id/registers/:registerIndex', async (req, res) => {
  try {
    const { id, registerIndex } = req.params;
    const registerUpdates = req.body;

    const template = await RegisterTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Шаблон не найден'
      });
    }

    const index = parseInt(registerIndex, 10);
    if (isNaN(index) || index < 0 || index >= template.registers.length) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный индекс регистра'
      });
    }

    // Обновляем только переданные поля
    Object.keys(registerUpdates).forEach(key => {
      if (registerUpdates[key] !== undefined) {
        template.registers[index][key] = registerUpdates[key];
      }
    });

    await template.save();

    // Реинициализируем Modbus для применения изменений
    await reinitializeModbus();

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Ошибка обновления регистра:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления регистра'
    });
  }
});

/**
 * @swagger
 * /api/config/templates/{id}:
 *   delete:
 *     summary: Удалить шаблон регистров
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId шаблона
 *     responses:
 *       200:
 *         description: Шаблон успешно удален
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
 *                   example: Шаблон удален
 *       400:
 *         description: Шаблон используется устройствами
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Шаблон не найден
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

