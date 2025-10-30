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
 * - wordOrder: порядок слов - 'BE' или 'LE' (для float, int32, uint32, double)
 * - scale: коэффициент масштабирования
 * - decimals: количество знаков после запятой
 * - unit: единица измерения (не обязательно для bool)
 * 
 * Примечание: для bool типа unit не используется в API
 * 
 * Примеры структуры в API:
 * Числовые: { "value": 150, "unit": "мм" }
 * Булевы:   { "value": true }
 */

export const boilerRegisters = [
  {
    key: 'Уровень воды в барабане',
    category: 'parameters',
    type: 'holding',
    address: 6,
    dataType: 'int16',
    scale: 1,
    decimals: 0,
    unit: 'мм'
  },
  {
    key: 'Разрежение в топке котла',
    category: 'parameters',
    type: 'holding',
    address: 8,
    dataType: 'float',
    byteOrder: 'BE',
    wordOrder: 'LE',  // младшее слово первым, как в старом коде
    scale: 1,
    decimals: 1,
    unit: 'Па'
  },
  {
    key: 'Давление воздуха перед горелкой',
    category: 'pressures',
    type: 'holding',
    address: 10,
    dataType: 'float',
    byteOrder: 'BE',
    wordOrder: 'LE',
    scale: 1,
    decimals: 0,
    unit: 'кПа'
  },
  {
    key: 'Давление газа перед горелкой',
    category: 'pressures',
    type: 'holding',
    address: 12,
    dataType: 'float',
    byteOrder: 'BE',
    wordOrder: 'LE',
    scale: 1,
    decimals: 0,
    unit: 'кПа'
  },
  {
    key: 'Давление пара на выходе',
    category: 'pressures',
    type: 'holding',
    address: 14,
    dataType: 'float',
    byteOrder: 'BE',
    wordOrder: 'LE',
    scale: 1,
    decimals: 1,
    unit: 'МПа'
  }
  // Пример булевого регистра:
  // {
  //   key: 'Горелка включена',
  //   category: 'status',
  //   type: 'coil',
  //   address: 0,
  //   dataType: 'bool',
  //   decimals: 0
  // }
];

