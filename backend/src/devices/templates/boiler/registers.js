import { parametersRegisters } from './parameters.js';
import { imRegisters } from './im.js';
import { othersRegisters } from './others.js';
import { statusRegisters } from './status.js';

/**
 * Все регистры котла
 */
export const boilerRegisters = [
  ...parametersRegisters,
  ...imRegisters,
  ...othersRegisters,
  ...statusRegisters
];

