import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { usersDB } from '../../utils/database.js';

// Схема настроек пользователя
const userSettingsSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light',
  }
}, {
  _id: false, 
  strict: false
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Пароль должен быть не менее 8 символов'],
    maxlength: [32, 'Пароль должен быть не более 32 символов'],
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Введите корректный email адрес']
  },
  role: {
    type: String,
    enum: ['admin', 'operator', 'viewer'],
    default: 'viewer',
  },
  settings: {
    type: userSettingsSchema,
    default: () => ({})
  }
}, {
  timestamps: true
})

// Хэширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  // Хэшируем только если пароль был изменен
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', async function(next) {
  // Проверяем только при создании нового пользователя (isNew)
  if (!this.isNew) return next();
  
  // Если роль уже явно указана, не меняем её
  if (this.role && this.role !== 'viewer') return next();
  
  try {
    // Считаем количество существующих пользователей
    const userCount = await User.countDocuments();
    
    // Если это первый пользователь, назначаем роль admin
    if (userCount === 0) {
      this.role = 'admin';
    } else {
      // Для остальных пользователей роль остается 'viewer' (дефолт)
      this.role = this.role || 'viewer';
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};


export const User = usersDB.model('User', userSchema);
