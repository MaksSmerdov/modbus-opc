import mongoose from 'mongoose';

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

// Индекс для быстрого поиска по времени
deviceDataSchema.index({ timestamp: -1 });

export function getDeviceModel(deviceName) {
  if (mongoose.models[deviceName]) {
    return mongoose.models[deviceName];
  }
  return mongoose.model(deviceName, deviceDataSchema, deviceName);
}

export default { getDeviceModel };