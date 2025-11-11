import mongoose from 'mongoose';
import { configDB } from '../../../utils/database.js';

/**
 * Схема порта
 */
const portSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  connectionType: {
    type: String,
    required: true,
    enum: ['RTU', 'TCP'],
    uppercase: true
  },

  // === Параметры для RTU ===
  port: {
    type: String,
    required: function () {
      return this.connectionType === 'RTU';
    }
  },
  baudRate: {
    type: Number,
    required: function () {
      return this.connectionType === 'RTU';
    },
    default: 9600,
    enum: [9600, 19200, 38400, 57600, 115200],
  },
  dataBits: {
    type: Number,
    default: 8,
    enum: [7, 8]
  },
  stopBits: {
    type: Number,
    default: 1,
    enum: [1, 2]
  },
  parity: {
    type: String,
    default: 'none',
    enum: ['none', 'even', 'odd'],
    lowercase: true
  },

  // === Параметры для TCP ===
  host: {
    type: String,
    required: function () {
      return this.connectionType === 'TCP';
    }
  },
  tcpPort: {
    type: Number,
    required: function () {
      return this.connectionType === 'TCP';
    },
  },

  // === Общие параметры ===
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

portSchema.index({ isActive: 1 });

export const Port = configDB.model('Port', portSchema);

