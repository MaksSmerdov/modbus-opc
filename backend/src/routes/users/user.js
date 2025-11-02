import express from 'express';
import { User } from '../../models/user/User.js';
import { adminOnlyMiddleware } from '../../middleware/auth.js';
import meRouter from './me.js';

const router = express.Router();

router.use('/me', meRouter);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (только admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 */
router.get('/', adminOnlyMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const normalizedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      data: normalizedUsers
    });
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка пользователей'
    });
  }
});

/**
 * @swagger
 * /api/users/{userId}/role:
 *   put:
 *     summary: Изменить роль пользователя (только admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, operator, viewer]
 *     responses:
 *       200:
 *         description: Роль успешно изменена
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Пользователь не найден
 */
router.put('/:userId/role', adminOnlyMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'operator', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректная роль. Допустимые значения: admin, operator, viewer'
      });
    }

    // Нельзя изменить роль самому себе (для безопасности)
    if (userId === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя изменить свою собственную роль'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка изменения роли:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка изменения роли пользователя'
    });
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Удалить пользователя (только admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь удален
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Пользователь не найден
 */
router.delete('/:userId', adminOnlyMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Нельзя удалить самого себя
    if (userId === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить самого себя'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      message: 'Пользователь успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления пользователя'
    });
  }
});

export default router;