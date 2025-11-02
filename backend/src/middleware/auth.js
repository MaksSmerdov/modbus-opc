import { User } from '../models/user/User.js';
import { verifyToken, isAccessToken, isRefreshToken, generateAccessToken } from '../utils/jwt.js';

/**
 * Middleware для проверки JWT токена с автоматическим обновлением
 * Проверяет access token, если истек - проверяет refresh token и обновляет access
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токены из заголовков
    const authHeader = req.headers.authorization;
    const refreshToken = req.headers['x-refresh-token'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Токен доступа не предоставлен'
      });
    }

    const accessToken = authHeader.substring(7); // Убираем "Bearer "

    // Проверяем access token
    let decoded = verifyToken(accessToken);
    let newAccessToken = null;

    // Если access token истек, проверяем refresh token
    if (decoded.expired && refreshToken) {
      const refreshDecoded = verifyToken(refreshToken);

      if (refreshDecoded.error || !isRefreshToken(refreshDecoded)) {
        return res.status(401).json({
          success: false,
          error: 'Сессия истекла. Необходимо войти заново'
        });
      }

      // Refresh токен валиден, получаем пользователя и создаем новый access token
      const user = await User.findById(refreshDecoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не найден'
        });
      }

      // Генерируем новый access token
      newAccessToken = generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      // Устанавливаем данные пользователя из refresh токена
      decoded = {
        userId: refreshDecoded.userId,
        email: user.email,
        role: user.role
      };
    } else if (decoded.error) {
      // Токен невалиден или другая ошибка
      if (decoded.invalid) {
        return res.status(401).json({
          success: false,
          error: 'Недействительный токен'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Ошибка проверки токена'
      });
    }

    // Проверяем, что это access token (не refresh)
    if (!isAccessToken(decoded) && !decoded.expired) {
      return res.status(401).json({
        success: false,
        error: 'Неверный тип токена'
      });
    }

    // Проверяем существование пользователя
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Сохраняем данные пользователя в запрос
    req.user = {
      userId: decoded.userId,
      email: decoded.email || user.email,
      role: decoded.role || user.role
    };

    // Если был создан новый access token, добавляем его в заголовок ответа
    if (newAccessToken) {
      res.setHeader('X-New-Access-Token', newAccessToken);
    }

    next();
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка проверки токена'
    });
  }
};

/**
 * Middleware для проверки роли пользователя
 * @param {...string} allowedRoles - Разрешенные роли
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не авторизован'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Недостаточно прав доступа'
      });
    }

    next();
  };
};

/**
 * Middleware для доступа только admin и operator (для конфигурации и управления опросом)
 */
export const adminOrOperatorMiddleware = roleMiddleware('admin', 'operator');

/**
 * Middleware только для admin (для управления ролями)
 */
export const adminOnlyMiddleware = roleMiddleware('admin');