import { Device } from '../models/config/index.js';

/**
 * Загружает активные устройства из БД с полной информацией
 * @returns {Promise<Array>} Массив устройств с заполненными профилями и шаблонами
 */
export async function loadDevicesFromDB() {
  try {
    const devices = await Device.find({ isActive: true })
      .populate('connectionProfileId')
      .populate('registerTemplateId')
      .lean();

    // Преобразуем в формат, удобный для ModbusManager
    const formattedDevices = devices.map(device => {
      const profile = device.connectionProfileId;
      const template = device.registerTemplateId;

      if (!profile || !template) {
        console.warn(`⚠ Устройство ${device.name} пропущено: отсутствует профиль или шаблон`);
        return null;
      }

      return {
        name: device.name,
        slaveId: device.slaveId,
        connectionProfile: {
          connectionType: profile.connectionType,
          // RTU параметры
          port: profile.port,
          baudRate: profile.baudRate,
          dataBits: profile.dataBits,
          stopBits: profile.stopBits,
          parity: profile.parity,
          // TCP параметры
          host: profile.host,
          tcpPort: profile.tcpPort,
          // Общие параметры
          timeout: profile.timeout,
          retries: profile.retries
        },
        registers: template.registers,
        saveInterval: device.saveInterval,
        logData: device.logData
      };
    }).filter(device => device !== null);

    return formattedDevices;
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

