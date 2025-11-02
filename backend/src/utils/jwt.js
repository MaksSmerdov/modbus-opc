import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ; 

/**
 * Создать access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );
}

/**
 * Создать refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    { userId: payload.userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Верифицировать токен
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { expired: true, error };
    }
    if (error.name === 'JsonWebTokenError') {
      return { invalid: true, error };
    }
    return { error };
  }
}

/**
 * Проверить, является ли токен refresh токеном
 */
export function isRefreshToken(decoded) {
  return decoded.type === 'refresh';
}

/**
 * Проверить, является ли токен access токеном
 */
export function isAccessToken(decoded) {
  return decoded.type === 'access';
}