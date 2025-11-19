/**
 * Форматирует порт для ответа - оставляет только релевантные поля
 * @param {Object} port - Объект порта из базы данных
 * @returns {Object} Отформатированный порт
 */
export function formatPort(port) {
  const base = {
    _id: port._id,
    name: port.name,
    connectionType: port.connectionType,
    isActive: port.isActive ?? true,
    createdAt: port.createdAt,
    updatedAt: port.updatedAt
  };

  if (port.connectionType === 'RTU') {
    return {
      ...base,
      port: port.port,
      baudRate: port.baudRate,
      dataBits: port.dataBits,
      stopBits: port.stopBits,
      parity: port.parity
    };
  } else if (port.connectionType === 'TCP') {
    return {
      ...base,
      host: port.host,
      tcpPort: port.tcpPort
    };
  }

  return base;
}

