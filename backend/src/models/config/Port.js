import mongoose from 'mongoose';
import { configDB } from '../../utils/database.js';

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
    required: function() {
      return this.connectionType === 'RTU';
    }
  },
  baudRate: {
    type: Number,
    required: function() {
      return this.connectionType === 'RTU';
    },
    enum: [9600, 19200, 38400, 57600, 115200]
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
    required: function() {
      return this.connectionType === 'TCP';
    }
  },
  tcpPort: {
    type: Number,
    required: function() {
      return this.connectionType === 'TCP';
    },
    default: 502
  },
  
  // === Общие параметры ===
  timeout: {
    type: Number,
    default: 500,
    min: 100,
    max: 10000
  },
  retries: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

export const Port = configDB.model('Port', portSchema);

