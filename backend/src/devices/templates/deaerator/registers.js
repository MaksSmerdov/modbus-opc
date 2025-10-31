import { parametersRegisters } from './parameters.js';
import { imRegisters } from './im.js';
import { setPointsRegisters } from './setPoints.js';

/**
 * Все регистры деаэратора
 */
export const deaeratorRegisters = [
  ...parametersRegisters,
  ...imRegisters,
  ...setPointsRegisters,
];

