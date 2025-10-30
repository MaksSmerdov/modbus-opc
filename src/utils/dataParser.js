export function getRegisterCount(dataType) {
  const typeMap = {
    'bool': 1,      
    'int16': 1,     
    'uint16': 1,    
    'int32': 2,     
    'uint32': 2,    
    'float': 2,     
    'double': 4     
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
    
    // Учитываем порядок слов для многорегистровых значений
    let registers = [...data];
    if (wordOrder === 'LE' && registers.length > 1) {
      registers = registers.reverse();
    }
    
    // Заполняем буфер с учетом порядка байт
    for (let i = 0; i < registers.length; i++) {
      if (byteOrder === 'BE') {
        buffer.writeUInt16BE(registers[i], i * 2);
      } else {
        buffer.writeUInt16LE(registers[i], i * 2);
      }
    }

    switch (dataType) {
      case 'int32':
        return byteOrder === 'BE' ? buffer.readInt32BE(0) : buffer.readInt32LE(0);

      case 'uint32':
        return byteOrder === 'BE' ? buffer.readUInt32BE(0) : buffer.readUInt32LE(0);

      case 'float':
        return byteOrder === 'BE' ? buffer.readFloatBE(0) : buffer.readFloatLE(0);

      case 'double':
        return byteOrder === 'BE' ? buffer.readDoubleBE(0) : buffer.readDoubleLE(0);

      default:
        return data[0];
    }
  } catch (error) {
    console.error(`Ошибка парсинга данных типа ${dataType}:`, error.message, 'data:', data);
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