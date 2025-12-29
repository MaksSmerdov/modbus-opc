/**
 * Класс для сбора и управления логами приложения
 */
class Logger {
  constructor(maxLogs = 1000) {
    this.logs = [];
    this.maxLogs = maxLogs;
    this.listeners = [];
  }

  /**
   * Добавляет лог в буфер
   * @param {string} level - Уровень лога: 'log', 'warn', 'error'
   * @param {string} message - Сообщение
   * @param {Object} metadata - Дополнительные данные
   */
  log(level, message, metadata = {}) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level, // 'log', 'warn', 'error'
      message,
      ...metadata
    };

    this.logs.push(logEntry);
    
    // Ограничиваем размер буфера
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Уведомляем слушателей
    this.listeners.forEach(listener => listener(logEntry));

    // Также выводим в консоль
    const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn : 
                          console.log;
    consoleMethod(`[${level.toUpperCase()}] ${message}`, metadata);
  }

  /**
   * Логирует ошибку
   */
  error(message, metadata) {
    this.log('error', message, metadata);
  }

  /**
   * Логирует предупреждение
   */
  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  /**
   * Логирует информационное сообщение
   */
  info(message, metadata) {
    this.log('log', message, metadata);
  }

  /**
   * Получает логи с фильтрацией
   * @param {number} limit - Максимальное количество логов
   * @param {string} level - Фильтр по уровню (опционально)
   * @returns {Array} Массив логов
   */
  getLogs(limit = 100, level = null) {
    let filtered = this.logs;
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered.slice(-limit);
  }

  /**
   * Очищает все логи
   */
  clear() {
    this.logs = [];
  }

  /**
   * Подписывается на новые логи
   * @param {Function} listener - Функция-обработчик
   * @returns {Function} Функция для отписки
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const logger = new Logger(1000);

