import { boilerRegisters } from './boiler.js';

/**
 * Регистры
 * 
 * Поля:
 * - key: название параметра (используется в API)
 * - category: категория данных для группировки
 * - type: тип регистра Modbus - 'holding', 'input', 'coil', 'discrete'
 * - address: адрес регистра
 * - dataType: тип данных - 'int16', 'uint16', 'int32', 'uint32', 'float', 'double', 'bool'
 * - byteOrder: порядок байт - 'BE' (Big Endian) или 'LE' (Little Endian)
 * - wordOrder: порядок слов - 'BE' или 'LE' (для float, int32, uint32, double), по умолчанию 'LE'
 * - scale: коэффициент масштабирования, по умолчанию 1
 * - decimals: количество знаков после запятой, по умолчанию 0
 * - unit: единица измерения (не обязательно для bool)
 * - minValue: минимальная допустимая уставка (необязательно, только для числовых типов)
 * - maxValue: максимальная допустимая уставка (необязательно, только для числовых типов)
 * - bitIndex: индекс бита (0-15) для извлечения из регистра (необязательно)
 * 
 * Битовые поля (bitIndex):
 * - Позволяет читать отдельные биты из одного регистра (например, статусы)
 * - Несколько параметров могут ссылаться на один адрес с разными bitIndex
 * - Значение всегда булево (true/false), unit и уставки не применяются
 * - Пример: регистр 0x0000 содержит биты 0-15, каждый бит - отдельный статус
 * 
 * Примеры структуры в API:
 * Числовые без уставок: { "value": 150, "unit": "мм" }
 * Числовые с уставками: { "value": 150, "unit": "мм", "isAlarm": false }
 * Булевы:               { "value": true }
 * Битовые поля:         { "value": true }
 * 
 * isAlarm появляется только если указаны minValue или maxValue
 * isAlarm = true, если value < minValue или value > maxValue
 */
export { boilerRegisters } from './boiler.js';

export const registersByType = {
  boiler: boilerRegisters
};

