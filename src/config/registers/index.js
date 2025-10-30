import { parametersRegisters } from './boiler/parameters.js';
import { imRegisters } from './boiler/im.js';
import { othersRegisters } from './boiler/others.js';

/**
 * Регистры для котла
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
 * 
 * Примечание: для bool типа unit не используется в API
 * 
 * Примеры структуры в API:
 * Числовые: { "value": 150, "unit": "мм" }
 * Булевы:   { "value": true }
 */

export const boilerRegisters = [
  ...parametersRegisters,
  ...imRegisters,
  ...othersRegisters
];

