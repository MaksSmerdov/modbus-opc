import { parametersRegisters } from './boiler/parameters.js';
import { imRegisters } from './boiler/im.js';
import { othersRegisters } from './boiler/others.js';
import { statusRegisters } from './boiler/status.js';

export const boilerRegisters = [
  ...parametersRegisters,
  ...imRegisters,
  ...othersRegisters,
  ...statusRegisters
];