import { getDeviceModel } from '../../models/DeviceData.js';
import { formatDate } from '../../utils/dateFormatter.js';

/**
 * Класс для сохранения данных Modbus устройств в БД
 */
class ModbusSaver {
  constructor(retries) {
    this.retries = retries;
  }

  /**
   * Сохранение данных устройства в БД
   * @param {Object} device - Устройство
   */
  async saveDeviceData(device) {
    // Пропускаем, если нет данных или устройство не отвечает
    if (!device.data || Object.keys(device.data).length === 0) {
      return;
    }

    if (device.failCount >= this.retries) {
      return;
    }

    try {
      // Получаем модель для конкретного устройства (создает отдельную коллекцию)
      const DeviceModel = getDeviceModel(device.name);
      
      const now = new Date();
      const deviceData = new DeviceModel({
        slaveId: device.slaveId,
        data: device.data,
        date: formatDate(now),
        timestamp: now
      });

      await deviceData.save();
      device.lastSave = now;
    } catch (error) {
      console.error(`✗ Ошибка сохранения данных ${device.name}:`, error.message);
    }
  }

  /**
   * Запуск автоматического сохранения для устройства
   * @param {Object} device - Устройство
   */
  startDeviceSaving(device) {
    if (device.saveTimer) {
      return;
    }

    const save = async () => {
      await this.saveDeviceData(device);
      
      // Планируем следующее сохранение
      device.saveTimer = setTimeout(save, device.saveInterval);
    };

    // Первое сохранение через saveInterval
    device.saveTimer = setTimeout(save, device.saveInterval);
  }

  /**
   * Остановка автоматического сохранения для устройства
   * @param {Object} device - Устройство
   */
  stopDeviceSaving(device) {
    if (device.saveTimer) {
      clearTimeout(device.saveTimer);
      device.saveTimer = null;
    }
  }

  /**
   * Остановка всех таймеров сохранения
   */
  stopAllSaving(devices) {
    devices.forEach(device => {
      this.stopDeviceSaving(device);
    });
  }
}

export default ModbusSaver;

