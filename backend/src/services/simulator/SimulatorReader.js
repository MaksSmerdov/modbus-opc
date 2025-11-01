/**
 * Класс для генерации симулированных данных
 * Имитирует чтение из Modbus устройств
 */
class SimulatorReader {
  constructor(connection) {
    this.connection = connection;
    // Кэш последних значений для более плавных изменений
    this.lastValues = new Map();
  }

  generateValue(register) {
    const key = `${register.address}_${register.bitIndex || 0}`;

    // Для битовых полей
    if (register.dataType === 'bits' && typeof register.bitIndex === 'number') {
      // Случайное булево с вероятностью 30% измениться
      const lastValue = this.lastValues.get(key);
      if (lastValue !== undefined && Math.random() > 0.3) {
        return lastValue;
      }
      const newValue = Math.random() > 0.5;
      this.lastValues.set(key, newValue);
      return newValue;
    }

    // Для булевых типов
    if (register.dataType === 'bool') {
      const lastValue = this.lastValues.get(key);
      if (lastValue !== undefined && Math.random() > 0.2) {
        return lastValue;
      }
      const newValue = Math.random() > 0.5;
      this.lastValues.set(key, newValue);
      return newValue;
    }

    // Для числовых типов - используем уставки если есть
    let min, max;

    if (register.minValue !== undefined && register.maxValue !== undefined) {
      // Генерируем с небольшим выходом за границы (10% шанс аварии)
      const range = register.maxValue - register.minValue;
      const margin = range * 0.1;
      min = register.minValue - margin;
      max = register.maxValue + margin;
    } else {
      // Дефолтные диапазоны по типам
      switch (register.dataType) {
        case 'int16':
          min = -1000;
          max = 1000;
          break;
        case 'uint16':
          min = 0;
          max = 1000;
          break;
        case 'int32':
          min = -10000;
          max = 10000;
          break;
        case 'uint32':
          min = 0;
          max = 10000;
          break;
        case 'float32':
        case 'double':
          min = 0;
          max = 100;
          break;
        default:
          min = 0;
          max = 100;
      }
    }

    // Генерируем значение с небольшим изменением от предыдущего для плавности
    const lastValue = this.lastValues.get(key);
    let newValue;

    if (lastValue !== undefined && Math.random() > 0.1) {
      // 90% времени меняем на небольшую величину
      const change = (max - min) * 0.05 * (Math.random() * 2 - 1);
      newValue = lastValue + change;
      // Ограничиваем диапазон
      newValue = Math.max(min, Math.min(max, newValue));
    } else {
      // 10% времени генерируем новое случайное значение
      newValue = min + Math.random() * (max - min);
    }

    this.lastValues.set(key, newValue);

    // Применяем масштабирование
    const scale = register.scale !== undefined ? register.scale : 1;
    newValue = newValue * scale;

    // Применяем округление
    const decimals = register.decimals !== undefined ? register.decimals : 0;
    return Number(newValue.toFixed(decimals));
  }

  /**
   * Симуляция чтения регистра
   * @param {Object} device - Устройство
   * @param {Object} register - Регистр для чтения
   */
  async readRegister(device, register) {
    try {
      // Имитация задержки чтения
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));

      // Проверка подключения
      if (!this.connection.isConnected) {
        throw new Error('Симулятор не подключен');
      }

      // Генерируем значение
      const value = this.generateValue(register);

      return {
        success: true,
        key: register.name || register.key, // name из БД, key для обратной совместимости
        category: register.category || 'default',
        address: register.address,
        dataType: register.dataType,
        rawValue: [value], // Имитация сырых данных
        value: value,
        unit: register.unit || '',
        minValue: register.minValue,
        maxValue: register.maxValue,
        bitIndex: register.bitIndex
      };
    } catch (error) {
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

export default SimulatorReader;

