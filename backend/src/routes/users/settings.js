import express from 'express';
import { User } from '../../models/user/User.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/me/settings:
 *   get:
 *     summary: Получить настройки текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Настройки пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserSettings'
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: user.settings || { theme: 'light' }
    });
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения настроек пользователя'
    });
  }
});

/**
 * @swagger
 * /api/users/me/settings:
 *   put:
 *     summary: Обновить настройки текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettingsUpdate'
 *     responses:
 *       200:
 *         description: Настройки успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { theme } = req.body;

    // Валидация
    if (theme && !['light', 'dark', 'auto'].includes(theme)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректное значение темы. Допустимые значения: light, dark, auto'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Обновляем настройки
    if (theme === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Не указаны поля для обновления'
      });
    }

    // Инициализируем settings, если их нет
    if (!user.settings) {
      user.settings = {};
    }

    user.settings.theme = theme;
    await user.save();

    res.json({
      success: true,
      data: user.settings
    });
  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления настроек пользователя'
    });
  }
});

export default router;