import ModbusManager from './ModbusManager.js';
import SimulatorManager from './simulator/SimulatorManager.js';
import { loadDevicesFromDB, hasDevicesInDB } from './deviceLoader.js';
import { config } from '../config/env.js';

/**
 * Добавляет устройства в менеджер
 */
function addDevicesToManager(manager, devices) {
  devices.forEach(device => {
    manager.addDevice({
      slaveId: device.slaveId,
      name: device.name,
      registers: device.registers,
      saveInterval: device.saveInterval || 30000,
      logData: device.logData || false
    });
  });
}

/**
 * Инициализирует менеджер: подключение, добавление устройств, запуск polling
 */
async function initializeManager(manager, devices) {
  await manager.connect();
  addDevicesToManager(manager, devices);
  manager.startPolling();
}

/**
 * Создает и инициализирует симулятор
 */
async function initSimulator(devices) {
  console.log(`\n=== Инициализация Симулятора (режим разработки) ===`);
  console.log(`Устройства: ${devices.map(d => d.name).join(', ')}`);
  
  const manager = new SimulatorManager({
    timeout: 100,
    retries: 3,
    pollInterval: 5000
  });

  await initializeManager(manager, devices);
  
  console.log('\n✓ Симулятор инициализирован и запущен\n');
  return manager;
}

/**
 * Создает и инициализирует Modbus менеджеры
 */
async function initModbusManagers(devicesByPort) {
  let lastManager = null;

  for (const [portKey, portData] of Object.entries(devicesByPort)) {
    const port = portData.port;
    
    console.log(`\n=== Инициализация Modbus на ${port.port} (${port.baudRate} baud) ===`);
    console.log(`Устройства на порту: ${portData.devices.map(d => d.name).join(', ')}`);
    
    const manager = new ModbusManager({
      connectionType: port.connectionType,
      port: port.port,
      baudRate: port.baudRate,
      dataBits: port.dataBits,
      stopBits: port.stopBits,
      parity: port.parity,
      timeout: port.timeout,
      retries: port.retries,
      pollInterval: 5000
    });

    await initializeManager(manager, portData.devices);
    lastManager = manager;
  }

  console.log('\n✓ Modbus инициализирован и запущен\n');
  return lastManager;
}

/**
 * Группирует устройства по портам
 */
function groupDevicesByPort(devices) {
  const devicesByPort = {};
  
  devices.forEach(device => {
    const port = device.port;
    const portKey = `${port.port}_${port.connectionType}`;
    if (!devicesByPort[portKey]) {
      devicesByPort[portKey] = {
        port: port,
        devices: []
      };
    }
    devicesByPort[portKey].devices.push(device);
  });

  return devicesByPort;
}

/**
 * Инициализация Modbus подключения и устройств
 * В режиме development использует симулятор вместо реального Modbus
 */
export async function initModbus() {
  try {
    // Проверяем наличие устройств в БД
    const hasDevices = await hasDevicesInDB();
    
    if (!hasDevices) {
      console.warn('⚠ В БД нет устройств. Запустите скрипт миграции или добавьте устройства через API.');
      console.warn('⚠ Modbus не инициализирован.');
      return null;
    }

    // Загружаем устройства из БД
    const devices = await loadDevicesFromDB();
    
    if (devices.length === 0) {
      console.warn('⚠ Нет активных устройств для инициализации.');
      return null;
    }

    console.log(`✓ Загружено ${devices.length} устройств(о) из БД`);

    const useSimulator = config.isDevelopment;

    if (useSimulator) {
      return await initSimulator(devices);
    } else {
      const devicesByPort = groupDevicesByPort(devices);
      return await initModbusManagers(devicesByPort);
    }
  } catch (error) {
    console.error('✗ Ошибка инициализации Modbus:', error.message);
    throw error;
  }
}