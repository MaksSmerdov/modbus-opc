import { getRegisterCount, parseData, applyScale, extractBit } from '../../utils/dataParser.js';

/**
 * Класс для чтения данных из Modbus устройств
 */
class ModbusReader {
  constructor(connection, timeout) {
    this.connection = connection;
    this.timeout = timeout;
  }

  /**
   * Чтение регистров с устройства
   * @param {Object} device - Устройство
   * @param {Object} register - Регистр для чтения
   */
  async readRegister(device, register) {
    try {
      // Устанавливаем таймаут перед каждым запросом
      this.connection.client.setTimeout(this.timeout);
      this.connection.client.setID(device.slaveId);
      
      // Определяем количество регистров для чтения на основе типа данных
      const length = getRegisterCount(register.dataType);
      
      let result;
      
      // Оборачиваем в Promise.race для гарантированного таймаута
      const readPromise = (async () => {
        switch (register.type) {
          case 'holding':
            return await this.connection.client.readHoldingRegisters(register.address, length);
          case 'input':
            return await this.connection.client.readInputRegisters(register.address, length);
          case 'coil':
            return await this.connection.client.readCoils(register.address, length);
          case 'discrete':
            return await this.connection.client.readDiscreteInputs(register.address, length);
          default:
            throw new Error(`Неизвестный тип регистра: ${register.type}`);
        }
      })();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), this.timeout + 100);
      });
      
      result = await Promise.race([readPromise, timeoutPromise]);

      // Парсим данные в соответствии с типом
      const byteOrder = register.byteOrder || 'BE';
      const wordOrder = register.wordOrder || 'LE';
      let parsedValue = parseData(result.data, register.dataType, byteOrder, wordOrder);
      
      // Если указан битовый индекс, извлекаем бит из значения
      if (register.bitIndex !== undefined) {
        parsedValue = extractBit(parsedValue, register.bitIndex);
      } else {
        // Применяем масштабирование (по умолчанию scale = 1) - только для не-битовых значений
        const scale = register.scale !== undefined ? register.scale : 1;
        if (parsedValue !== null) {
          parsedValue = applyScale(parsedValue, scale);
        }

        // Применяем округление (по умолчанию decimals = 0) - только для не-битовых значений
        const decimals = register.decimals !== undefined ? register.decimals : 0;
        if (parsedValue !== null && typeof parsedValue === 'number') {
          parsedValue = Number(parsedValue.toFixed(decimals));
        }
      }

      return {
        success: true,
        key: register.key,
        category: register.category || 'default',
        address: register.address,
        dataType: register.dataType,
        rawValue: result.data,
        value: parsedValue,
        unit: register.unit || '',
        minValue: register.minValue,
        maxValue: register.maxValue,
        bitIndex: register.bitIndex
      };
    } catch (error) {
      // Очищаем буферы после ошибки
      try {
        if (this.connection.client.isOpen) {
          this.connection.client._port?.flush?.();
        }
      } catch (flushError) {
        // Игнорируем ошибки при очистке
      }
      
      return {
        success: false,
        key: register.key,
        category: register.category || 'default',
        address: register.address,
        dataType: register.dataType,
        error: error.message
      };
    }
  }
}

export default ModbusReader;

