import { logDeviceData } from '../../utils/deviceLogger.js';

/**
 * Класс для опроса Modbus устройств
 */
class ModbusPoller {
  constructor(reader) {
    this.reader = reader;
  }

  async pollDevice(device) {
    if (!this.reader.connection.isConnected) {
      console.warn('⚠ Нет подключения к Modbus');
      return;
    }

    try {
      const results = [];
      let hasError = false;

      for (const register of device.registers) {
        const result = await this.reader.readRegister(device, register);
        results.push(result);

        if (!result.success && results.length === 1) {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        device.failCount++;
        device.lastError = results[0].error;

        if (device.failCount > device.retries) {
          console.warn(`⊘ ${device.name} не отвечает, ожидание переподключения...`);
        } else {
          console.warn(`⚠ ${device.name} не отвечает (${device.failCount}/${device.retries})`);
        }

        await this.delay(100);

        return { success: false, device, error: results[0].error };
      }

      device.data = {};
      results.forEach(r => {
        if (r.success) {
          if (!device.data[r.category]) {
            device.data[r.category] = {};
          }

          if (r.dataType === 'bool' || (r.dataType === 'bits' && typeof r.bitIndex === 'number')) {
            device.data[r.category][r.key] = {
              value: r.value
            };
          } else {
            const paramData = {
              value: r.value,
              unit: r.unit || ''
            };

            // Проверяем уставки, если они заданы 
            if ((r.minValue !== null && r.minValue !== undefined) || (r.maxValue !== null && r.maxValue !== undefined)) {
              let isAlarm = false;

              if (r.value !== null && typeof r.value === 'number') {
                if (r.minValue !== undefined && r.value < r.minValue) {
                  isAlarm = true;
                }
                if (r.maxValue !== undefined && r.value > r.maxValue) {
                  isAlarm = true;
                }
              }

              paramData.isAlarm = isAlarm;
            }

            device.data[r.category][r.key] = paramData;
          }
        }
      });

      // Если устройство восстановилось после отключения
      if (device.failCount > 0) {
        console.log(`✓ ${device.name} - связь восстановлена`);
      }

      device.failCount = 0;
      device.lastSuccess = new Date();
      device.lastError = null;

      // Выводим данные в консоль, если включен флаг logData
      if (device.logData) {
        logDeviceData(device);
      }

      return { success: true, device, results };

    } catch (error) {
      device.failCount++;
      device.lastError = error.message;

      if (device.failCount > device.retries) {
        console.warn(`⊘ ${device.name} не отвечает, ожидание переподключения...`);
      } else {
        console.warn(`⚠ ${device.name} не отвечает (${device.failCount}/${device.retries})`);
      }

      return { success: false, device, error: error.message };
    }
  }

  /**
   * Цикл опроса всех устройств
   */
  async pollAllDevices(devices) {
    if (!this.reader.connection.isConnected) {
      console.warn('⚠ Нет подключения для опроса устройств');
      return;
    }

    if (devices.length === 0) {
      console.warn('⚠ Нет устройств для опроса');
      return;
    }

    for (const device of devices) {
      // Проверяем активность устройства и порта
      if (!device.isActive || !device.portIsActive) {
        continue;
      }

      if (device.failCount >= device.retries) {
        const now = Date.now();
        const shouldRetry = !device.lastRetryAttempt ||
          (now - device.lastRetryAttempt >= 60000);

        if (!shouldRetry) {
          continue;
        }

        device.lastRetryAttempt = now;
      }

      try {
        await this.pollDevice(device);
      } catch (error) {
        device.failCount++;
        device.lastError = error.message;
        await this.delay(200);
      }

      await this.delay(100);
    }
  }

  /**
   * Вспомогательная функция задержки
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ModbusPoller;

