import { getDeviceModel } from '../../models/index.js';
import { formatDate } from '../../utils/dateFormatter.js';
import { logger } from '../../utils/logger.js';

/**
 * Класс для сохранения данных Modbus устройств в БД
 */
class ModbusSaver {
  constructor() {
  }

  async saveDeviceData(device) {
    if (!device.data || Object.keys(device.data).length === 0) {
      return;
    }

    if (device.failCount >= device.retries) {
      return;
    }

    try {
      const DeviceModel = getDeviceModel(device.slug || device.name);

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
      logger.error(`Ошибка сохранения данных ${device.name}: ${error.message}`, {
        deviceName: device.name,
        deviceSlug: device.slug,
        error: error.message
      });
    }
  }

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

  stopDeviceSaving(device) {
    if (device.saveTimer) {
      clearTimeout(device.saveTimer);
      device.saveTimer = null;
    }
  }

  stopAllSaving(devices) {
    devices.forEach(device => {
      this.stopDeviceSaving(device);
    });
  }
}

export default ModbusSaver;

