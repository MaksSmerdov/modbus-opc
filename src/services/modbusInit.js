import ModbusManager from './ModbusManager.js';
import SimulatorManager from './simulator/SimulatorManager.js';
import { config } from '../config/env.js';
import devicesConfig from '../config/devices.js';

/**
 * Инициализация Modbus подключения и устройств
 * В режиме development использует симулятор вместо реального Modbus
 * @returns {Promise<ModbusManager|SimulatorManager>} Инициализированный менеджер
 */
export async function initModbus() {
  try {
    const devicesByPort = {};
    
    devicesConfig.forEach(device => {
      const portKey = `${device.port}_${device.connectionType}`;
      if (!devicesByPort[portKey]) {
        devicesByPort[portKey] = {
          config: device,
          devices: []
        };
      }
      devicesByPort[portKey].devices.push(device);
    });

    let manager = null;
    
    // Выбираем режим работы
    const useSimulator = config.isDevelopment;

    if (useSimulator) {
      // Режим разработки - используем симулятор
      console.log(`\n=== Инициализация Симулятора (режим разработки) ===`);
      console.log(`Устройства: ${devicesConfig.map(d => d.name).join(', ')}`);
      
      manager = new SimulatorManager({
        timeout: 100,
        retries: 3,
        pollInterval: 5000 // интервал опроса в режиме симуляции
      });

      await manager.connect();

      devicesConfig.forEach(device => {
        manager.addDevice({
          slaveId: device.slaveId,
          name: device.name,
          registers: device.registers,
          saveInterval: device.saveInterval || 30000,
          logData: device.logData || false
        });
      });

      manager.startPolling();
      
      console.log('\n✓ Симулятор инициализирован и запущен\n');
    } else {
      for (const [portKey, portData] of Object.entries(devicesByPort)) {
        const portConfig = portData.config;
        
        console.log(`\n=== Инициализация Modbus на ${portConfig.port} (${portConfig.baudRate} baud) ===`);
        console.log(`Устройства на порту: ${portData.devices.map(d => d.name).join(', ')}`);
        
        manager = new ModbusManager({
          connectionType: portConfig.connectionType,
          port: portConfig.port,
          baudRate: portConfig.baudRate,
          dataBits: portConfig.dataBits,
          stopBits: portConfig.stopBits,
          parity: portConfig.parity,
          timeout: portConfig.timeout,
          retries: portConfig.retries,
          pollInterval: 5000 // интервал опроса всех устройств
        });

        // Подключаемся к порту
        await manager.connect();

        portData.devices.forEach(device => {
          manager.addDevice({
            slaveId: device.slaveId,
            name: device.name,
            registers: device.registers,
            saveInterval: device.saveInterval || 30000,
            logData: device.logData || false
          });
        });

        manager.startPolling();
      }

      console.log('\n✓ Modbus инициализирован и запущен\n');
    }

    return manager;
  } catch (error) {
    console.error('✗ Ошибка инициализации Modbus:', error.message);
    throw error;
  }
}

