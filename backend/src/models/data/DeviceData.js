import mongoose from 'mongoose';
import { dataDB } from '../../utils/database.js';

/**
 * Схема для сохранения данных устройств
 */
const deviceDataSchema = new mongoose.Schema({
  slaveId: {
    type: Number,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

deviceDataSchema.index({ timestamp: -1 });

/**
 * Получает или создает модель для конкретного устройства
 * @param {string} deviceName - Название устройства
 * @returns {mongoose.Model} Mongoose модель
 */
export function getDeviceModel(deviceName) {
  if (dataDB.models[deviceName]) {
    return dataDB.models[deviceName];
  }
  return dataDB.model(deviceName, deviceDataSchema, deviceName);
}

export default { getDeviceModel };

