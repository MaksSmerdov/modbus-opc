import { boilerRegisters } from './registers/index.js';

/**
 * Конфигурация устройств
 * 
 * Каждое устройство содержит:
 * - name: название устройства
 * - slaveId: ID устройства в сети Modbus (1-247)
 * - port: COM-порт для RTU или IP для TCP
 * - connectionType: 'RTU' или 'TCP'
 * - baudRate: скорость передачи (для RTU)
 * - dataBits: биты данных (для RTU)
 * - stopBits: стоповые биты (для RTU)
 * - parity: четность - 'none', 'even', 'odd' (для RTU)
 * - timeout: таймаут ответа устройства (мс)
 * - retries: количество попыток перед пропуском
 * - saveInterval: интервал сохранения в БД (мс), по умолчанию 30000
 * - registers: ссылка на файл регистров
 */

const devicesConfig = [
  {
    name: 'boiler1',
    slaveId: 1,
    port: 'COM16',
    connectionType: 'RTU',
    baudRate: 57600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    timeout: 500,
    retries: 3,
    saveInterval: 30000,
    registers: boilerRegisters
  },
  {
    name: 'boiler2',
    slaveId: 2,
    port: 'COM16',
    connectionType: 'RTU',
    baudRate: 57600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    timeout: 500,
    retries: 3,
    saveInterval: 30000,
    registers: boilerRegisters
  },
  {
    name: 'boiler3',
    slaveId: 3,
    port: 'COM16',
    connectionType: 'RTU',
    baudRate: 57600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    timeout: 500,
    retries: 3,
    saveInterval: 30000,
    registers: boilerRegisters
  },
 
];

export default devicesConfig;

