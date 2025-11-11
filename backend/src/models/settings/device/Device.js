import mongoose from 'mongoose';
import { configDB } from '../../../utils/database.js';

/**
 * Схема устройства
 */
const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-_]+$/, 'Slug может содержать только латинские буквы, цифры, дефисы и подчеркивания']
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

/**
 * Функция для генерации slug из name
 * @param {string} name - Имя устройства
 * @returns {string} - Slug
 */
function generateSlug(name) {
  const translit = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  let slug = name
    .toLowerCase()
    .split('')
    .map(char => {
      const lowerChar = char.toLowerCase();
      return translit[lowerChar] || (/[a-z0-9]/.test(char) ? char : '-');
    })
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Если slug пустой, используем дефолт
  return slug || 'device';
}

// Pre-save hook для автогенерации slug если не указан
deviceSchema.pre('save', async function (next) {
  // Если slug не указан, генерируем из name
  if (!this.slug && this.name) {
    let baseSlug = generateSlug(this.name);

    // Проверяем уникальность и добавляем число если нужно
    let finalSlug = baseSlug;
    let counter = 1;

    // Используем this.constructor для доступа к модели
    const DeviceModel = this.constructor;

    // Проверяем существование устройства с таким slug (исключая текущий)
    const existing = await DeviceModel.findOne({
      slug: finalSlug,
      _id: { $ne: this._id }
    });

    if (existing) {
      // Если slug уже существует, добавляем число
      while (true) {
        finalSlug = `${baseSlug}-${counter}`;
        const check = await DeviceModel.findOne({
          slug: finalSlug,
          _id: { $ne: this._id }
        });
        if (!check) break;
        counter++;
      }
    }

    this.slug = finalSlug;
  }
  next();
});

// Индекс для slug создается автоматически через unique: true
deviceSchema.index({ slaveId: 1 });
deviceSchema.index({ isActive: 1 });

export const Device = configDB.model('Device', deviceSchema);

