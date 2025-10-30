import ModbusManager from './ModbusManager.js';
import devicesConfig from '../config/devices.js';

/**
 * Инициализация Modbus подключения и устройств
 * @returns {Promise<ModbusManager>} Инициализированный ModbusManager
 */
export async function initModbus() {
  try {
    // Группируем устройства по портам
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

    let modbusManager = null;

    // Создаем ModbusManager для каждого порта
    for (const [portKey, portData] of Object.entries(devicesByPort)) {
      const config = portData.config;
      
      console.log(`\n=== Инициализация Modbus на ${config.port} (${config.baudRate} baud) ===`);
      console.log(`Устройства на порту: ${portData.devices.map(d => d.name).join(', ')}`);
      
      const manager = new ModbusManager({
        connectionType: config.connectionType,
        port: config.port,
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        timeout: config.timeout,
        retries: config.retries,
        pollInterval: 5000 // интервал опроса всех устройств
      });

      // Подключаемся к порту
      await manager.connect();

      // Добавляем все устройства на этом порту
      portData.devices.forEach(device => {
        manager.addDevice({
          slaveId: device.slaveId,
          name: device.name,
          registers: device.registers,
          saveInterval: device.saveInterval || 30000
        });
      });

      // Запускаем опрос
      manager.startPolling();
      
      modbusManager = manager; // сохраняем последний менеджер (для одного порта)
    }

    console.log('\n✓ Modbus инициализирован и запущен\n');
    return modbusManager;
  } catch (error) {
    console.error('✗ Ошибка инициализации Modbus:', error.message);
    throw error;
  }
}

