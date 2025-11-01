import mongoose from 'mongoose';
import { configDB } from '../../utils/database.js';

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
      isPollingEnabled: true
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

