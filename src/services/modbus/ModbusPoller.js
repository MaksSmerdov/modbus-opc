/**
 * Класс для опроса Modbus устройств
 */
class ModbusPoller {
  constructor(reader, retries) {
    this.reader = reader;
    this.retries = retries;
  }

  /**
   * Опрос одного устройства
   * @param {Object} device - Устройство
   */
  async pollDevice(device) {
    if (!this.reader.connection.isConnected) {
      console.warn('⚠ Нет подключения к Modbus');
      return;
    }

    try {
      const results = [];
      let hasError = false;
      
      // Читаем все регистры устройства
      for (const register of device.registers) {
        const result = await this.reader.readRegister(device, register);
        results.push(result);
        
        // Если первый регистр не читается, прерываем опрос устройства
        if (!result.success && results.length === 1) {
          hasError = true;
          break;
        }
      }

      // Если была ошибка на первом регистре, увеличиваем счетчик и выходим
      if (hasError) {
        device.failCount++;
        device.lastError = results[0].error;
        
        if (device.failCount > this.retries) {
          console.warn(`⊘ ${device.name} не отвечает, ожидание переподключения...`);
        } else {
          console.warn(`⚠ ${device.name} не отвечает (${device.failCount}/${this.retries})`);
        }
        
        // Добавляем задержку после ошибки, чтобы дать порту восстановиться
        await this.delay(100);
        
        return { success: false, device, error: results[0].error };
      }

      // Обновляем данные устройства, группируя по категориям
      device.data = {};
      results.forEach(r => {
        if (r.success) {
          // Создаем категорию, если её нет
          if (!device.data[r.category]) {
            device.data[r.category] = {};
          }
          
          // Для булевых значений - только value, для остальных - value + unit
          if (r.dataType === 'bool') {
            device.data[r.category][r.key] = {
              value: r.value
            };
          } else {
            device.data[r.category][r.key] = {
              value: r.value,
              unit: r.unit || ''
            };
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
      
      return { success: true, device, results };

    } catch (error) {
      device.failCount++;
      device.lastError = error.message;
      
      if (device.failCount > this.retries) {
        console.warn(`⊘ ${device.name} не отвечает, ожидание переподключения...`);
      } else {
        console.warn(`⚠ ${device.name} не отвечает (${device.failCount}/${this.retries})`);
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
      // Если устройство не отвечает много раз
      if (device.failCount >= this.retries) {
        // Проверяем, прошло ли 60 секунд с последней попытки
        const now = Date.now();
        const shouldRetry = !device.lastRetryAttempt || 
                            (now - device.lastRetryAttempt >= 60000); // 60 секунд
        
        if (!shouldRetry) {
          continue; // Пропускаем до следующей попытки
        }
        
        // Сбрасываем время последней попытки
        device.lastRetryAttempt = now;
      }
    
      try {
        // Оборачиваем в try-catch, чтобы ошибка одного устройства не останавливала опрос других
        await this.pollDevice(device);
      } catch (error) {
        device.failCount++;
        device.lastError = error.message;
        // Увеличенная задержка после критической ошибки
        await this.delay(200);
      }
      
      // Небольшая задержка между устройствами на одном порту
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

