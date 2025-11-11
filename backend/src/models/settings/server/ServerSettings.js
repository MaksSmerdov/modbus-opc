import mongoose from 'mongoose';
import { configDB } from '../../../utils/database.js';

/**
 * Схема настроек сервера
 */
const serverSettingsSchema = new mongoose.Schema({
  // Используем фиксированный _id для singleton паттерна
  _id: {
    type: String,
    default: 'server_settings'
  },
  isPollingEnabled: {
    type: Boolean,
    default: true,
    required: true
  },
  pollInterval: {
    type: Number,
    default: 5000,
    required: true,
    min: 1000,
    max: 60000,
    description: 'Интервал опроса Modbus устройств в миллисекундах'
  }
}, {
  timestamps: true
});

export const ServerSettings = configDB.model('ServerSettings', serverSettingsSchema);

/**
 * Получить настройки сервера (создает, если не существует)
 */
export async function getServerSettings() {
  let settings = await ServerSettings.findById('server_settings');

  if (!settings) {
    settings = await ServerSettings.create({
      _id: 'server_settings',
      isPollingEnabled: true,
      pollInterval: 5000
    });
  }

  return settings;
}

/**
 * Обновить состояние опроса
 */
export async function updatePollingState(isEnabled) {
  const settings = await ServerSettings.findByIdAndUpdate(
    'server_settings',
    { isPollingEnabled: isEnabled },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return settings;
}

/**
 * Обновить настройки сервера
 */
export async function updateServerSettings(updates) {
  const settings = await ServerSettings.findByIdAndUpdate(
    'server_settings',
    updates,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return settings;
}

