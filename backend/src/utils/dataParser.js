export function getRegisterCount(dataType) {
  const typeMap = {
    'bool': 1,      
    'int16': 1,     
    'uint16': 1,    
    'int32': 2,     
    'uint32': 2,    
    'float32': 2,     
    'double': 4,
    'int32_float32': 4  // 8 байт = 4 регистра
  };

  return typeMap[dataType] || 1;
}


export function parseData(data, dataType, byteOrder = 'BE', wordOrder = 'BE') {
  if (!data || data.length === 0) {
    return null;
  }

  try {
    // Для типов bool и 16-битных значений
    if (dataType === 'bool') {
      return data[0] !== 0;
    }

    if (dataType === 'int16') {
      return data[0] > 32767 ? data[0] - 65536 : data[0];
    }

    if (dataType === 'uint16') {
      return data[0];
    }

    // Для 32-битных и 64-битных значений
    const buffer = Buffer.allocUnsafe(data.length * 2);
    
    // Обработка различных форматов порядка байтов для Modbus
    let registers = [...data];
    let writeByteOrder = 'BE'; // По умолчанию Big Endian для записи в буфер
    
    // Преобразуем старые обозначения для обратной совместимости
    if (byteOrder === 'BE' || byteOrder === 'ABCD') {
      // ABCD - Big Endian (стандартный Modbus)
      // Регистры как есть, байты в BE
      writeByteOrder = 'BE';
    } else if (byteOrder === 'LE' || byteOrder === 'DCBA') {
      // DCBA - Little Endian (все перевернуто)
      // Меняем порядок регистров и байтов
      registers = registers.reverse();
      writeByteOrder = 'LE';
    } else if (byteOrder === 'BADC') {
      // BADC - Mid-Big Endian (byte swap)
      // Меняем порядок регистров, байты остаются BE
      registers = registers.reverse();
      writeByteOrder = 'BE';
    } else if (byteOrder === 'CDAB') {
      // CDAB - Mid-Little Endian (word swap)
      // Регистры как есть, но байты LE
      writeByteOrder = 'LE';
    } else {
      // Для обратной совместимости с wordOrder
      if (wordOrder === 'LE' && registers.length > 1) {
        registers = registers.reverse();
      }
      writeByteOrder = byteOrder === 'LE' ? 'LE' : 'BE';
    }
    
    // Заполняем буфер
    for (let i = 0; i < registers.length; i++) {
      if (writeByteOrder === 'BE') {
        buffer.writeUInt16BE(registers[i], i * 2);
      } else {
        buffer.writeUInt16LE(registers[i], i * 2);
      }
    }

    switch (dataType) {
      case 'int32':
        return buffer.readInt32BE(0);

      case 'uint32':
        return buffer.readUInt32BE(0);

      case 'float32':
        return buffer.readFloatBE(0);

      case 'double':
        return buffer.readDoubleBE(0);

      case 'int32_float32':
        return {
          int32Value: buffer.readInt32BE(0),
          float32Value: buffer.readFloatBE(4)
        };

      default:
        return data[0];
    }
  } catch (error) {
    console.error(`Ошибка парсинга данных типа ${dataType}:`, error.message, 'data:', data, 'byteOrder:', byteOrder);
    return null;
  }
}


export function extractBit(value, bitIndex) {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (bitIndex < 0 || bitIndex > 15) {
    console.error(`Недопустимый индекс бита: ${bitIndex}. Должен быть от 0 до 15.`);
    return null;
  }
  
  return ((value >> bitIndex) & 1) === 1;
}

export function applyScale(value, scale = 1) {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (scale === 1) {
    return value;
  }
  
  return value * scale;
}