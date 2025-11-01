import ModbusConnection from './modbus/ModbusConnection.js';
import ModbusReader from './modbus/ModbusReader.js';
import ModbusPoller from './modbus/ModbusPoller.js';
import ModbusSaver from './modbus/ModbusSaver.js';

/**
 * Главный класс для управления Modbus подключением и опросом устройств
 */
class ModbusManager {
  constructor(config = {}) {
    this.pollInterval = config.pollInterval || 1000;

    // Инициализация модулей
    this.connection = new ModbusConnection(config);
    this.reader = new ModbusReader(this.connection);
    this.poller = new ModbusPoller(this.reader);
    this.saver = new ModbusSaver();

    // Список устройств
    this.devices = [];

    // Состояние опроса
    this.isPolling = false;
    this.pollTimer = null;
  }

  async connect() {
    return await this.connection.connect();
  }

  async disconnect() {
    this.stopPolling();
    this.saver.stopAllSaving(this.devices);
    await this.connection.disconnect();
  }

  addDevice(device) {
    if (!device.slaveId || device.slaveId < 1 || device.slaveId > 247) {
      throw new Error('slaveId должен быть от 1 до 247');
    }

    const deviceConfig = {
      slaveId: device.slaveId,
      name: device.name || `Device_${device.slaveId}`,
      registers: device.registers || [],
      isActive: device.isActive ?? true,
      portIsActive: device.portIsActive ?? true,
      timeout: device.timeout || 500,
      retries: device.retries || 3,
      saveInterval: device.saveInterval || 30000,
      logData: device.logData || false,
      failCount: 0,
      lastSuccess: null,
      lastError: null,
      lastSave: null,
      lastRetryAttempt: null,
      data: {},
      saveTimer: null
    };

    this.devices.push(deviceConfig);
    console.log(`✓ Добавлено устройство: ${deviceConfig.name} (ID: ${device.slaveId})`);

    // Запускаем таймер сохранения в БД
    this.saver.startDeviceSaving(deviceConfig);

    return deviceConfig;
  }

  removeDevice(slaveId) {
    const index = this.devices.findIndex(d => d.slaveId === slaveId);
    if (index !== -1) {
      const device = this.devices.splice(index, 1)[0];
      this.saver.stopDeviceSaving(device);
      console.log(`✓ Удалено устройство: ${device.name}`);
      return true;
    }
    return false;
  }

  /**
   * Обновляет состояние активности устройства
   * @param {string} deviceName - Имя устройства
   * @param {boolean} isActive - Новое состояние активности устройства
   * @param {boolean} portIsActive - Новое состояние активности порта
   */
  updateDeviceStatus(deviceName, isActive, portIsActive) {
    const device = this.devices.find(d => d.name === deviceName);
    if (device) {
      device.isActive = isActive ?? device.isActive;
      if (portIsActive !== undefined) {
        device.portIsActive = portIsActive;
      }
      console.log(`✓ Обновлено состояние устройства ${deviceName}: isActive=${device.isActive}, portIsActive=${device.portIsActive}`);
      return true;
    }
    return false;
  }

  /**
   * Обновляет состояние активности порта для всех устройств на этом порту
   * @param {string} portName - Имя порта (используется для поиска устройств через связь с портом)
   * @param {boolean} portIsActive - Новое состояние активности порта
   */
  updatePortStatusForDevices(portIsActive) {
    // Обновляем portIsActive для всех устройств (т.к. на одном ModbusManager обычно один порт)
    let updated = 0;
    this.devices.forEach(device => {
      if (device.portIsActive !== portIsActive) {
        device.portIsActive = portIsActive;
        updated++;
      }
    });
    if (updated > 0) {
      console.log(`✓ Обновлено состояние порта для ${updated} устройств: portIsActive=${portIsActive}`);
    }
    return updated;
  }

  startPolling() {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;

    const poll = async () => {
      if (!this.isPolling) return;

      await this.poller.pollAllDevices(this.devices);

      if (this.isPolling) {
        this.pollTimer = setTimeout(poll, this.pollInterval);
      }
    };

    poll();
  }

  stopPolling() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
  }

  getDevicesStatus() {
    return this.devices.map(device => ({
      slaveId: device.slaveId,
      name: device.name,
      failCount: device.failCount,
      lastSuccess: device.lastSuccess,
      lastError: device.lastError,
      isResponding: device.failCount < device.retries,
      data: device.data
    }));
  }
}

export default ModbusManager;
