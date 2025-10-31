import connectDB from '../utils/database.js';
import { Device, ConnectionProfile, RegisterTemplate } from '../models/config/index.js';
import { connectionProfiles } from '../devices/connections.js';
import { devices } from '../devices/instances.js';
import { boilerRegisters } from '../devices/templates/boiler/registers.js';
import { deaeratorRegisters } from '../devices/templates/deaerator/registers.js';

/**
 * Определяет длину регистра на основе типа данных
 */
function getRegisterLength(dataType) {
  const lengthMap = {
    'int16': 1,
    'uint16': 1,
    'int32': 2,
    'uint32': 2,
    'float32': 2,
    'float': 2,
    'string': 1,
    'bits': 1
  };
  
  return lengthMap[dataType] || 1;
}

/**
 * Преобразует старый формат регистра в новый
 */
function transformRegister(oldRegister) {
  const address = typeof oldRegister.address === 'number' 
    ? oldRegister.address 
    : parseInt(oldRegister.address, 10);

  let dataType = oldRegister.dataType;
  if (dataType === 'float') {
    dataType = 'float32';
  }

  return {
    address,
    length: getRegisterLength(dataType),
    name: oldRegister.key || oldRegister.name || `Register_${address}`,
    category: oldRegister.category || 'general',
    dataType: dataType ? dataType.toLowerCase() : 'uint16',
    scale: oldRegister.scale || 1,
    offset: oldRegister.offset || 0,
    unit: oldRegister.unit || '',
    description: ''
  };
}

/**
 * Мигрирует профили подключений
 */
async function migrateConnectionProfiles() {
  console.log('\n=== Миграция профилей подключений ===');
  
  const profilesMap = {};
  
  for (const [profileName, profileData] of Object.entries(connectionProfiles)) {
    try {
      // Проверяем, существует ли уже профиль
      let profile = await ConnectionProfile.findOne({ name: profileName });
      
      if (profile) {
        console.log(`⚠ Профиль "${profileName}" уже существует, пропускаем`);
        profilesMap[profileName] = profile._id;
        continue;
      }

      // Создаем новый профиль
      profile = await ConnectionProfile.create({
        name: profileName,
        connectionType: profileData.connectionType,
        // RTU параметры
        port: profileData.port,
        baudRate: profileData.baudRate,
        dataBits: profileData.dataBits || 8,
        stopBits: profileData.stopBits || 1,
        parity: profileData.parity || 'none',
        // TCP параметры
        host: profileData.host,
        tcpPort: profileData.tcpPort,
        // Общие параметры
        timeout: profileData.timeout || 500,
        retries: profileData.retries || 3
      });

      profilesMap[profileName] = profile._id;
      console.log(`✓ Создан профиль: ${profileName}`);
    } catch (error) {
      console.error(`✗ Ошибка создания профиля ${profileName}:`, error.message);
    }
  }

  return profilesMap;
}

/**
 * Мигрирует шаблоны регистров
 */
async function migrateRegisterTemplates() {
  console.log('\n=== Миграция шаблонов регистров ===');
  
  const templatesMap = {};
  
  // Словарь с шаблонами
  const templates = {
    'boiler': {
      name: 'boiler_template',
      deviceType: 'boiler',
      registers: boilerRegisters
    },
    'deaerator': {
      name: 'deaerator_template',
      deviceType: 'deaerator',
      registers: deaeratorRegisters
    }
  };

  for (const [templateKey, templateData] of Object.entries(templates)) {
    try {
      // Проверяем, существует ли уже шаблон
      let template = await RegisterTemplate.findOne({ name: templateData.name });
      
      if (template) {
        console.log(`⚠ Шаблон "${templateData.name}" уже существует, пропускаем`);
        templatesMap[templateKey] = template._id;
        continue;
      }

      // Преобразуем регистры
      const transformedRegisters = templateData.registers.map(transformRegister);

      // Создаем новый шаблон
      template = await RegisterTemplate.create({
        name: templateData.name,
        deviceType: templateData.deviceType,
        registers: transformedRegisters
      });

      templatesMap[templateKey] = template._id;
      console.log(`✓ Создан шаблон: ${templateData.name} (${transformedRegisters.length} регистров)`);
    } catch (error) {
      console.error(`✗ Ошибка создания шаблона ${templateKey}:`, error.message);
    }
  }

  return templatesMap;
}

/**
 * Определяет тип устройства по регистрам
 */
function getDeviceType(registers) {
  if (registers === boilerRegisters) {
    return 'boiler';
  }
  if (registers === deaeratorRegisters) {
    return 'deaerator';
  }
  return 'unknown';
}

/**
 * Находит имя профиля по объекту профиля
 */
function findProfileName(profileObj) {
  for (const [name, profile] of Object.entries(connectionProfiles)) {
    if (profile === profileObj) {
      return name;
    }
  }
  return null;
}

/**
 * Мигрирует устройства
 */
async function migrateDevices(profilesMap, templatesMap) {
  console.log('\n=== Миграция устройств ===');
  
  for (const device of devices) {
    try {
      // Проверяем, существует ли уже устройство
      const existingDevice = await Device.findOne({ name: device.name });
      
      if (existingDevice) {
        console.log(`⚠ Устройство "${device.name}" уже существует, пропускаем`);
        continue;
      }

      // Находим имя профиля
      const profileName = findProfileName(device.connectionProfile);
      if (!profileName) {
        console.error(`✗ Не найден профиль для устройства ${device.name}`);
        continue;
      }

      const profileId = profilesMap[profileName];
      if (!profileId) {
        console.error(`✗ Не найден ID профиля ${profileName}`);
        continue;
      }

      // Определяем тип устройства
      const deviceType = getDeviceType(device.registers);
      const templateId = templatesMap[deviceType];
      
      if (!templateId) {
        console.error(`✗ Не найден шаблон для типа ${deviceType}`);
        continue;
      }

      // Создаем устройство
      await Device.create({
        name: device.name,
        slaveId: device.slaveId,
        connectionProfileId: profileId,
        registerTemplateId: templateId,
        saveInterval: device.saveInterval || 30000,
        logData: device.logData || false,
        isActive: true
      });

      console.log(`✓ Создано устройство: ${device.name} (Slave ID: ${device.slaveId})`);
    } catch (error) {
      console.error(`✗ Ошибка создания устройства ${device.name}:`, error.message);
    }
  }
}

/**
 * Главная функция миграции
 */
async function migrate() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   СКРИПТ МИГРАЦИИ КОНФИГУРАЦИИ       ║');
  console.log('╚══════════════════════════════════════╝');

  try {
    // Подключаемся к БД
    await connectDB();

    // Мигрируем данные
    const profilesMap = await migrateConnectionProfiles();
    const templatesMap = await migrateRegisterTemplates();
    await migrateDevices(profilesMap, templatesMap);

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║   МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!        ║');
    console.log('╚══════════════════════════════════════╝\n');

    // Выводим статистику
    const profilesCount = await ConnectionProfile.countDocuments();
    const templatesCount = await RegisterTemplate.countDocuments();
    const devicesCount = await Device.countDocuments();

    console.log('Статистика:');
    console.log(`  - Профилей подключений: ${profilesCount}`);
    console.log(`  - Шаблонов регистров: ${templatesCount}`);
    console.log(`  - Устройств: ${devicesCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Критическая ошибка миграции:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
migrate();

