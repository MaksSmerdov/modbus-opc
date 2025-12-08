import ModbusManager from './ModbusManager.js';
import SimulatorManager from './simulator/SimulatorManager.js';
import { loadDevicesFromDB, hasDevicesInDB } from './deviceLoader.js';
import { config } from '../config/env.js';
import { getServerSettings } from '../models/settings/index.js';

/**
 * Добавляет устройства в менеджер
 */
function addDevicesToManager(manager, devices) {
  devices.forEach((device) => {
    manager.addDevice({
      slaveId: device.slaveId,
      name: device.name,
      slug: device.slug,
      registers: device.registers,
      timeout: device.timeout,
      retries: device.retries,
      saveInterval: device.saveInterval || 30000,
      logData: device.logData || false,
      isActive: device.isActive,
      portIsActive: device.portIsActive,
    });
  });
}

/**
 * Инициализирует менеджер: подключение, добавление устройств
 * Примечание: опрос НЕ запускается автоматически, это контролируется состоянием из БД в server.js
 */
async function initializeManager(manager, devices) {
  addDevicesToManager(manager, devices);
}

/**
 * Создает и инициализирует симулятор
 */
async function initSimulator(devices, pollInterval = 5000) {
  console.log(`\n=== Инициализация Симулятора (режим разработки) ===`);
  console.log(`Устройства: ${devices.map((d) => d.name).join(', ')}`);
  console.log(`Интервал опроса: ${pollInterval}мс`);

  const manager = new SimulatorManager({
    pollInterval,
  });

  await initializeManager(manager, devices);

  console.log('\n✓ Симулятор инициализирован (опрос будет запущен на основе состояния в БД)\n');
  return manager;
}

/**
 * Создает и инициализирует Modbus менеджеры
 */
async function initModbusManagers(devicesByPort, pollInterval = 5000) {
  let lastManager = null;

  for (const [, portData] of Object.entries(devicesByPort)) {
    const port = portData.port;
    const isRTU = port.connectionType === 'RTU';

    if (isRTU) {
      console.log(`\n=== Инициализация Modbus RTU на ${port.port} (${port.baudRate} baud) ===`);
    } else {
      console.log(`\n=== Инициализация Modbus TCP на ${port.host}:${port.tcpPort} ===`);
    }
    console.log(`Устройства на порту: ${portData.devices.map((d) => d.name).join(', ')}`);
    console.log(`Интервал опроса: ${pollInterval}мс`);

    const manager = new ModbusManager({
      connectionType: port.connectionType,
      port: isRTU ? port.port : undefined,
      baudRate: isRTU ? port.baudRate : undefined,
      dataBits: isRTU ? port.dataBits : undefined,
      stopBits: isRTU ? port.stopBits : undefined,
      parity: isRTU ? port.parity : undefined,
      tcpHost: port.host,
      tcpPort: port.tcpPort,
      pollInterval,
    });

    await initializeManager(manager, portData.devices);
    lastManager = manager;
  }

  console.log('\n✓ Modbus инициализирован (опрос будет запущен на основе состояния в БД)\n');
  return lastManager;
}

/**
 * Группирует устройства по портам
 */
function groupDevicesByPort(devices) {
  const devicesByPort = {};

  devices.forEach((device) => {
    const port = device.port;
    const portKey = port.connectionType === 'RTU' ? `${port.port}_RTU` : `${port.host}:${port.tcpPort}_TCP`;

    if (!devicesByPort[portKey]) {
      devicesByPort[portKey] = {
        port,
        devices: [],
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
    // Получаем настройки сервера (включая интервал опроса)
    const settings = await getServerSettings();
    const pollInterval = settings.pollInterval || 5000;

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
      return await initSimulator(devices, pollInterval);
    } else {
      const devicesByPort = groupDevicesByPort(devices);
      return await initModbusManagers(devicesByPort, pollInterval);
    }
  } catch (error) {
    console.error('✗ Ошибка инициализации Modbus:', error.message);
    throw error;
  }
}
