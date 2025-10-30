import ModbusConnection from './modbus/ModbusConnection.js';
import ModbusReader from './modbus/ModbusReader.js';
import ModbusPoller from './modbus/ModbusPoller.js';
import ModbusSaver from './modbus/ModbusSaver.js';

/**
 * Главный класс для управления Modbus подключением и опросом устройств
 */
class ModbusManager {
  constructor(config = {}) {
    // Настройки
    this.retries = config.retries || 3;
    this.pollInterval = config.pollInterval || 1000;
    
    // Инициализация модулей
    this.connection = new ModbusConnection(config);
    this.reader = new ModbusReader(this.connection, config.timeout || 1000);
    this.poller = new ModbusPoller(this.reader, this.retries);
    this.saver = new ModbusSaver(this.retries);
    
    // Список устройств
    this.devices = [];
    
    // Состояние опроса
    this.isPolling = false;
    this.pollTimer = null;
  }

  /**
   * Подключение к порту
   */
  async connect() {
    return await this.connection.connect();
  }

  /**
   * Отключение от порта
   */
  async disconnect() {
    this.stopPolling();
    this.saver.stopAllSaving(this.devices);
    await this.connection.disconnect();
  }

  /**
   * Добавление устройства для опроса
   * @param {Object} device - Настройки устройства
   */
  addDevice(device) {
    if (!device.slaveId || device.slaveId < 1 || device.slaveId > 247) {
      throw new Error('slaveId должен быть от 1 до 247');
    }

    const deviceConfig = {
      slaveId: device.slaveId,
      name: device.name || `Device_${device.slaveId}`,
      registers: device.registers || [],
      saveInterval: device.saveInterval || 30000,
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

  /**
   * Удаление устройства
   * @param {number} slaveId - ID устройства
   */
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
   * Запуск автоматического опроса
   */
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

  /**
   * Остановка автоматического опроса
   */
  stopPolling() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
  }

  /**
   * Получение статуса всех устройств
   */
  getDevicesStatus() {
    return this.devices.map(device => ({
      slaveId: device.slaveId,
      name: device.name,
      failCount: device.failCount,
      lastSuccess: device.lastSuccess,
      lastError: device.lastError,
      isResponding: device.failCount < this.retries,
      data: device.data
    }));
  }
}

export default ModbusManager;
