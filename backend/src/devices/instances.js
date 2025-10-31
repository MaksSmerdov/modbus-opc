import { connectionProfiles } from './connections.js';
import { boilerRegisters } from './templates/boiler/registers.js';
import { deaeratorRegisters } from './templates/deaerator/registers.js';

/**
 * Экземпляры устройств в системе
 * 
 * Каждое устройство содержит:
 * - name: название устройства
 * - slaveId: ID устройства в сети Modbus (1-247)
 * - connectionProfile: ссылка на профиль подключения из connections.js
 * - registers: массив регистров для этого устройства
 * - saveInterval: интервал сохранения в БД (мс), по умолчанию 30000
 * - logData: выводить данные в консоль (по умолчанию false)
 */

export const devices = [
  {
    name: 'boiler1',
    slaveId: 1,
    connectionProfile: connectionProfiles.rtu_com16_57600,
    registers: boilerRegisters,
    saveInterval: 30000,
    logData: false
  },
  {
    name: 'boiler2',
    slaveId: 2,
    connectionProfile: connectionProfiles.rtu_com16_57600,
    registers: boilerRegisters,
    saveInterval: 30000,
    logData: false
  },
  {
    name: 'boiler3',
    slaveId: 3,
    connectionProfile: connectionProfiles.rtu_com16_57600,
    registers: boilerRegisters,
    saveInterval: 30000,
    logData: false
  },
  {
    name: 'deaerator',
    slaveId: 4,
    connectionProfile: connectionProfiles.rtu_com16_57600,
    registers: deaeratorRegisters,
    saveInterval: 30000,
    logData: true
  },
];

// Для обратной совместимости экспортируем как default
export default devices;

