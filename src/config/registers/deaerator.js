import { parametersRegisters } from './deaerator/parameters.js';
import { imRegisters } from './deaerator/im.js';
import { setPointsRegisters } from './deaerator/setPoints.js';

export const deaeratorRegisters = [
  ...parametersRegisters,
  ...imRegisters,
  ...setPointsRegisters,
];