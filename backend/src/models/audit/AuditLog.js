import mongoose from 'mongoose';
import { configDB } from '../../utils/database.js';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['device', 'port', 'tag', 'user', 'polling']
  },
  entityName: {
    type: String,
    required: true
  },
  oldValue: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ entityType: 1 });

export const AuditLog = configDB.model('AuditLog', auditLogSchema);

