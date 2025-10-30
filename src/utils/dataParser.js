/**
 * Утилита для парсинга данных разных типов из Modbus регистров
 */

/**
 * Определяет количество регистров для чтения в зависимости от типа данных
 * @param {string} dataType - Тип данных
 * @returns {number} Количество регистров (каждый регистр = 16 бит = 2 байта)
 */
export function getRegisterCount(dataType) {
  const typeMap = {
    'bool': 1,      // 1 регистр
    'int16': 1,     // 1 регистр
    'uint16': 1,    // 1 регистр
    'int32': 2,     // 2 регистра
    'uint32': 2,    // 2 регистра
    'float': 2,     // 2 регистра (32 бита)
    'double': 4     // 4 регистра (64 бита)
  };

  return typeMap[dataType] || 1;
}

/**
 * Парсит сырые данные из регистров в нужный тип
 * @param {Array} data - Массив значений регистров
 * @param {string} dataType - Тип данных для парсинга
 * @param {string} byteOrder - Порядок байт: 'BE' (Big Endian) или 'LE' (Little Endian)
 * @param {string} wordOrder - Порядок слов: 'BE' (Big Endian) или 'LE' (Little Endian)
 * @returns {number|boolean} Распарсенное значение
 */
export function parseData(data, dataType, byteOrder = 'BE', wordOrder = 'BE') {
  if (!data || data.length === 0) {
    return null;
  }

  try {
    // Для типов bool и 16-битных значений
    if (dataType === 'bool') {
      return data[0] !== 0;
    }

    if (dataType === 'int16') {
      return data[0] > 32767 ? data[0] - 65536 : data[0];
    }

    if (dataType === 'uint16') {
      return data[0];
    }

    // Для 32-битных и 64-битных значений
    const buffer = Buffer.allocUnsafe(data.length * 2);
    
    // Учитываем порядок слов для многорегистровых значений
    let registers = [...data];
    if (wordOrder === 'LE' && registers.length > 1) {
      // Меняем порядок регистров (слов)
      registers = registers.reverse();
    }
    
    // Заполняем буфер с учетом порядка байт
    for (let i = 0; i < registers.length; i++) {
      if (byteOrder === 'BE') {
        buffer.writeUInt16BE(registers[i], i * 2);
      } else {
        buffer.writeUInt16LE(registers[i], i * 2);
      }
    }

    switch (dataType) {
      case 'int32':
        return byteOrder === 'BE' ? buffer.readInt32BE(0) : buffer.readInt32LE(0);

      case 'uint32':
        return byteOrder === 'BE' ? buffer.readUInt32BE(0) : buffer.readUInt32LE(0);

      case 'float':
        return byteOrder === 'BE' ? buffer.readFloatBE(0) : buffer.readFloatLE(0);

      case 'double':
        return byteOrder === 'BE' ? buffer.readDoubleBE(0) : buffer.readDoubleLE(0);

      default:
        // Если тип не распознан, возвращаем первое значение
        return data[0];
    }
  } catch (error) {
    console.error(`Ошибка парсинга данных типа ${dataType}:`, error.message, 'data:', data);
    return null;
  }
}

/**
 * Применяет масштабирование к значению
 * @param {number} value - Значение
 * @param {number} scale - Коэффициент масштабирования
 * @returns {number} Масштабированное значение
 */
export function applyScale(value, scale = 1) {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (scale === 1) {
    return value;
  }
  
  return value * scale;
}

/**
 * Форматирует значение с единицей измерения
 * @param {number} value - Значение
 * @param {string} unit - Единица измерения
 * @returns {string} Отформатированная строка
 */
export function formatValue(value, unit = '') {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  if (unit) {
    return `${value} ${unit}`;
  }
  
  return value.toString();
}

