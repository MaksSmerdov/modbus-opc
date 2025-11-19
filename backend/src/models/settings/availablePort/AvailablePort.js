import mongoose from 'mongoose';
import { configDB } from '../../../utils/database.js';

/**
 * Схема настроек доступных COM-портов
 */
const availablePortSchema = new mongoose.Schema({
  portName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^COM\d+$/, 'Некорректное имя COM-порта']
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
availablePortSchema.index({ portName: 1 });
availablePortSchema.index({ isHidden: 1 });

export const AvailablePort = configDB.model('AvailablePort', availablePortSchema);

