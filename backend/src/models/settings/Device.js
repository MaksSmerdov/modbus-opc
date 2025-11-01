import mongoose from 'mongoose';
import { configDB } from '../../utils/database.js';

/**
 * Схема устройства
 */
const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slaveId: {
    type: Number,
    required: true,
    min: 1,
    max: 247
  },
  portId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Port',
    required: true
  },
  timeout: {
    type: Number,
    default: 500,
    min: 500,
    max: 30000
  },
  retries: {
    type: Number,
    default: 3,
    min: 1,
    max: 15
  },
  saveInterval: {
    type: Number,
    default: 30000,
    min: 5000
  },
  logData: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

deviceSchema.index({ slaveId: 1 });
deviceSchema.index({ isActive: 1 });

export const Device = configDB.model('Device', deviceSchema);

