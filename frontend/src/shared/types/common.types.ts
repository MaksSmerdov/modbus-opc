/**
 * Общие типы для всего приложения
 */

/**
 * Стандартный ответ API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * Базовая сущность с timestamps
 */
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Статус загрузки
 */
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

