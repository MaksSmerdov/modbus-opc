/**
 * Модуль для управления реинициализацией Modbus
 * Используется для избежания циклических зависимостей
 */

let reinitializeFunction = null;

/**
 * Устанавливает функцию реинициализации
 * @param {Function} fn - Функция реинициализации
 */
export function setReinitializeFunction(fn) {
  reinitializeFunction = fn;
}

/**
 * Реинициализирует Modbus Manager
 * @returns {Promise<boolean>} true если успешно
 */
export async function reinitializeModbus() {
  if (!reinitializeFunction) {
    console.warn('⚠ Функция реинициализации Modbus не установлена');
    return false;
  }
  
  return await reinitializeFunction();
}

