import { Device, Tag } from '../models/config/index.js';

/**
 * Загружает активные устройства из БД с полной информацией
 * @returns {Promise<Array>} Массив устройств с заполненными портами и тэгами
 */
export async function loadDevicesFromDB() {
  try {
    const devices = await Device.find({ isActive: true })
      .populate('portId')
      .lean();

    // Преобразуем в формат, удобный для ModbusManager
    const formattedDevices = await Promise.all(
      devices.map(async (device) => {
        const port = device.portId;

        if (!port) {
          console.warn(`⚠ Устройство ${device.name} пропущено: отсутствует порт`);
          return null;
        }

        // Загружаем тэги устройства
        const tags = await Tag.find({ deviceId: device._id }).lean();

        if (tags.length === 0) {
          console.warn(`⚠ Устройство ${device.name} пропущено: отсутствуют тэги`);
          return null;
        }

        return {
          name: device.name,
          slaveId: device.slaveId,
          port: {
            connectionType: port.connectionType,
            // RTU параметры
            port: port.port,
            baudRate: port.baudRate,
            dataBits: port.dataBits,
            stopBits: port.stopBits,
            parity: port.parity,
            // TCP параметры
            host: port.host,
            tcpPort: port.tcpPort,
            // Общие параметры
            timeout: port.timeout,
            retries: port.retries
          },
          registers: tags.map(tag => ({
            address: tag.address,
            length: tag.length,
            name: tag.name,
            category: tag.category,
            functionCode: tag.functionCode,
            dataType: tag.dataType,
            bitIndex: tag.bitIndex,
            byteOrder: tag.byteOrder,
            scale: tag.scale,
            offset: tag.offset,
            decimals: tag.decimals,
            unit: tag.unit,
            minValue: tag.minValue,
            maxValue: tag.maxValue,
            description: tag.description
          })),
          saveInterval: device.saveInterval,
          logData: device.logData
        };
      })
    );

    return formattedDevices.filter(device => device !== null);
  } catch (error) {
    console.error('✗ Ошибка загрузки устройств из БД:', error.message);
    throw error;
  }
}

/**
 * Проверяет наличие устройств в БД
 * @returns {Promise<boolean>} true если есть хотя бы одно устройство
 */
export async function hasDevicesInDB() {
  try {
    const count = await Device.countDocuments();
    return count > 0;
  } catch (error) {
    console.error('✗ Ошибка проверки устройств в БД:', error.message);
    return false;
  }
}

