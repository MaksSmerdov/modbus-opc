import { logger } from '../../utils/logger.js';

/**
 * Класс для опроса Modbus устройств
 */
class ModbusPoller {
  constructor(reader) {
    this.reader = reader;
  }

  async pollDevice(device) {
    if (!this.reader.connection.isConnected) {
      logger.warn('Нет подключения к Modbus', { deviceName: device.name });
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
          logger.warn(`${device.name} не отвечает, ожидание переподключения...`, {
            deviceName: device.name,
            failCount: device.failCount,
            retries: device.retries
          });
        } else {
          logger.warn(`${device.name} не отвечает (${device.failCount}/${device.retries})`, {
            deviceName: device.name,
            failCount: device.failCount,
            retries: device.retries
          });
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
          } else if (r.dataType === 'int32_float32') {
            // Для составного типа выбираем значение в зависимости от compositeDisplay
            const compositeValue = r.value; // объект { int32Value, float32Value }
            const displayMode = r.compositeDisplay || 'float32'; // по умолчанию float32
            
            let finalValue;
            if (compositeValue && typeof compositeValue === 'object') {
              if (displayMode === 'int32') {
                finalValue = compositeValue.int32Value;
              } else if (displayMode === 'float32') {
                finalValue = compositeValue.float32Value;
              } else { // 'both'
                // Для 'both' оставляем объект
                finalValue = compositeValue;
              }
            } else {
              finalValue = null;
            }

            const paramData = {
              value: finalValue,
              unit: r.unit || ''
            };

            // Проверяем уставки для выбранного значения
            if ((r.minValue !== null && r.minValue !== undefined) || (r.maxValue !== null && r.maxValue !== undefined)) {
              let isAlarm = false;

              if (finalValue !== null && typeof finalValue === 'number') {
                if (r.minValue !== undefined && finalValue < r.minValue) {
                  isAlarm = true;
                }
                if (r.maxValue !== undefined && finalValue > r.maxValue) {
                  isAlarm = true;
                }
              } else if (displayMode === 'both' && finalValue && typeof finalValue === 'object') {
                // Для 'both' проверяем оба значения
                if (finalValue.int32Value !== null && typeof finalValue.int32Value === 'number') {
                  if (r.minValue !== undefined && finalValue.int32Value < r.minValue) {
                    isAlarm = true;
                  }
                  if (r.maxValue !== undefined && finalValue.int32Value > r.maxValue) {
                    isAlarm = true;
                  }
                }
                if (finalValue.float32Value !== null && typeof finalValue.float32Value === 'number') {
                  if (r.minValue !== undefined && finalValue.float32Value < r.minValue) {
                    isAlarm = true;
                  }
                  if (r.maxValue !== undefined && finalValue.float32Value > r.maxValue) {
                    isAlarm = true;
                  }
                }
              }

              paramData.isAlarm = isAlarm;
            }

            device.data[r.category][r.key] = paramData;
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
        logger.info(`${device.name} - связь восстановлена`, { deviceName: device.name });
      }

      device.failCount = 0;
      device.lastSuccess = new Date();
      device.lastError = null;

      return { success: true, device, results };

    } catch (error) {
      device.failCount++;
      device.lastError = error.message;

      if (device.failCount > device.retries) {
        logger.error(`${device.name} не отвечает, ожидание переподключения...`, {
          deviceName: device.name,
          error: error.message,
          failCount: device.failCount,
          retries: device.retries
        });
      } else {
        logger.warn(`${device.name} не отвечает (${device.failCount}/${device.retries})`, {
          deviceName: device.name,
          error: error.message,
          failCount: device.failCount,
          retries: device.retries
        });
      }

      return { success: false, device, error: error.message };
    }
  }

  /**
   * Цикл опроса всех устройств
   */
  async pollAllDevices(devices) {
    if (!this.reader.connection.isConnected) {
      logger.warn('Нет подключения для опроса устройств');
      return;
    }

    if (devices.length === 0) {
      logger.warn('Нет устройств для опроса');
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

