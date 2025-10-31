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
  connectionProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectionProfile',
    required: true
  },
  registerTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegisterTemplate',
    required: true
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

