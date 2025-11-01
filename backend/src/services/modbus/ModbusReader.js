import { getRegisterCount, parseData, applyScale, extractBit } from '../../utils/dataParser.js';

/**
 * Класс для чтения данных из Modbus устройств
 */
class ModbusReader {
  constructor(connection) {
    this.connection = connection;
  }

  async readRegister(device, register) {
    try {
      const timeout = device.timeout || 500;
      this.connection.client.setTimeout(timeout);
      this.connection.client.setID(device.slaveId);

      // Используем length из БД для string, для остальных вычисляем автоматически
      // Для string length обязателен, для остальных типов можно не указывать - вычислится автоматически
      const length = register.dataType === 'string'
        ? (register.length || 1)  // Для string используем из БД (обязательно должно быть указано)
        : (register.length || getRegisterCount(register.dataType));  // Для остальных используем из БД или вычисляем

      let result;

      // Оборачиваем в Promise.race для гарантированного таймаута
      const readPromise = (async () => {
        // Поддерживаем оба варианта: functionCode (из БД) и type (старые шаблоны)
        const funcCode = register.functionCode || register.type;

        switch (funcCode) {
          case 'holding':
            return await this.connection.client.readHoldingRegisters(register.address, length);
          case 'input':
            return await this.connection.client.readInputRegisters(register.address, length);
          case 'coil':
            return await this.connection.client.readCoils(register.address, length);
          case 'discrete':
            return await this.connection.client.readDiscreteInputs(register.address, length);
          default:
            throw new Error(`Неизвестный тип регистра: ${funcCode}`);
        }
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout + 100);
      });

      result = await Promise.race([readPromise, timeoutPromise]);

      // Парсим данные в соответствии с типом
      const byteOrder = register.byteOrder || 'BE';
      const wordOrder = register.wordOrder || 'LE';
      let parsedValue = parseData(result.data, register.dataType, byteOrder, wordOrder);

      // Если указан битовый индекс, извлекаем бит из значения
      if (register.dataType === 'bits' && typeof register.bitIndex === 'number') {
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
        key: register.name || register.key, // name из БД, key для обратной совместимости
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
        key: register.name || register.key, // name из БД, key для обратной совместимости
        category: register.category || 'default',
        address: register.address,
        dataType: register.dataType,
        error: error.message
      };
    }
  }
}

export default ModbusReader;

