import SimulatorConnection from './SimulatorConnection.js';
import SimulatorReader from './SimulatorReader.js';
import ModbusPoller from '../modbus/ModbusPoller.js';
import ModbusSaver from '../modbus/ModbusSaver.js';

/**
 * Менеджер симуляции - аналог ModbusManager для режима разработки
 * Полностью совместим с интерфейсом ModbusManager
 */
class SimulatorManager {
  constructor(config = {}) {
    // Настройки
    this.retries = config.retries || 3;
    this.pollInterval = config.pollInterval || 1000;
    
    // Инициализация модулей
    this.connection = new SimulatorConnection(config);
    this.reader = new SimulatorReader(this.connection, config.timeout || 100);
    this.poller = new ModbusPoller(this.reader, this.retries);
    this.saver = new ModbusSaver(this.retries);
    
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
    console.log(`✓ Добавлено устройство (симуляция): ${deviceConfig.name} (ID: ${device.slaveId})`);
    
    // Запускаем таймер сохранения в БД
    this.saver.startDeviceSaving(deviceConfig);
    
    return deviceConfig;
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

}

export default SimulatorManager;

