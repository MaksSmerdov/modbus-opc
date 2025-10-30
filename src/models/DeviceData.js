import mongoose from 'mongoose';

/**
 * Схема для сохранения данных устройств
 */
const deviceDataSchema = new mongoose.Schema({
  // ID устройства в сети Modbus
  slaveId: {
    type: Number,
    required: true
  },
  
  // Данные устройства (сгруппированные по категориям)
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Время сохранения (локальное)
  date: {
    type: String,
    required: true,
    index: true
  },
  
  // Временная метка для сортировки
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Индекс для быстрого поиска по времени
deviceDataSchema.index({ timestamp: -1 });

/**
 * Получить или создать модель для устройства
 * @param {string} deviceName - Название устройства (например, "Boiler1")
 * @returns {Model} Mongoose модель для этого устройства
 */
export function getDeviceModel(deviceName) {
  // Проверяем, существует ли уже модель
  if (mongoose.models[deviceName]) {
    return mongoose.models[deviceName];
  }
  
  // Создаем новую модель с именем устройства как именем коллекции
  return mongoose.model(deviceName, deviceDataSchema, deviceName);
}

export default { getDeviceModel };

