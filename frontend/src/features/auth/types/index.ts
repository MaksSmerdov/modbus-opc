// Импортируем общие типы из shared
import type { User, UserRole } from '../../../shared/types';

// Реэкспортируем для удобства использования в модуле auth
export type { User, UserRole };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}