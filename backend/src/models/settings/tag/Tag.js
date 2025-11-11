import mongoose from 'mongoose';
import { configDB } from '../../../utils/database.js';

/**
 * Схема тэга (регистра устройства)
 */
const tagSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  address: {
    type: Number,
    required: true,
    min: 0,
    max: 65535
  },
  length: {
    type: Number,
    required: function () {
      // Обязателен только для string
      return this.dataType === 'string';
    },
    min: 1,
    max: 125,
    default: function () {
      // Автоматически вычисляем для типов с фиксированной длиной
      const typeMap = {
        'bool': 1,
        'int16': 1,
        'uint16': 1,
        'bits': 1,
        'int32': 2,
        'uint32': 2,
        'float32': 2,
        'double': 4
      };
      return typeMap[this.dataType];
    }
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },

  // Тип функции Modbus
  functionCode: {
    type: String,
    required: true,
    enum: ['holding', 'input', 'coil', 'discrete'],
    lowercase: true,
    default: 'holding'
  },

  dataType: {
    type: String,
    required: true,
    enum: ['int16', 'uint16', 'int32', 'uint32', 'float32', 'string', 'bits'],
    lowercase: true
  },

  // Индекс бита в регистре (только для типа 'bits')
  bitIndex: {
    type: Number,
    min: 0,
    max: 15,
    default: null,
    validate: {
      validator: function (value) {
        // bitIndex обязателен только если dataType === 'bits'
        if (this.dataType === 'bits' && (value === null || value === undefined)) {
          return false;
        }
        // Для других типов bitIndex должен быть null
        if (this.dataType !== 'bits' && value !== null) {
          return false;
        }
        return true;
      },
      message: 'bitIndex обязателен для типа "bits" и должен быть null для других типов'
    }
  },

  // Порядок байтов для многобайтовых типов
  byteOrder: {
    type: String,
    default: 'ABCD',
    enum: ['BE', 'LE', 'ABCD', 'CDAB', 'BADC', 'DCBA'],
    uppercase: true
  },

  scale: {
    type: Number,
    default: 1
  },
  offset: {
    type: Number,
    default: 0
  },

  // Количество знаков после запятой для округления
  decimals: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },

  unit: {
    type: String,
    default: ''
  },

  // Уставки (лимиты значений)
  minValue: {
    type: Number,
    default: null
  },
  maxValue: {
    type: Number,
    default: null
  },

  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Индексы для ускорения поиска
tagSchema.index({ deviceId: 1 });
tagSchema.index({ deviceId: 1, address: 1 });

export const Tag = configDB.model('Tag', tagSchema);

