import mongoose from 'mongoose';
import { configDB } from '../../utils/database.js';

/**
 * Схема регистра
 */
const registerSchema = new mongoose.Schema({
  address: {
    type: Number,
    required: true,
    min: 0,
    max: 65535
  },
  length: {
    type: Number,
    required: true,
    min: 1,
    max: 125
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  dataType: {
    type: String,
    required: true,
    enum: ['int16', 'uint16', 'int32', 'uint32', 'float32', 'string', 'bits'],
    lowercase: true
  },
  scale: {
    type: Number,
    default: 1
  },
  offset: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
}, { _id: false });

/**
 * Схема шаблона регистров
 */
const registerTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  deviceType: {
    type: String,
    required: true,
    trim: true
  },
  registers: [registerSchema]
}, {
  timestamps: true
});

registerTemplateSchema.index({ deviceType: 1 });

export const RegisterTemplate = configDB.model('RegisterTemplate', registerTemplateSchema);

