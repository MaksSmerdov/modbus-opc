/**
 * Утилита для вывода данных устройств в консоль
 */

/**
 * Форматированный вывод данных устройства в консоль
 * @param {Object} device - Устройство с данными
 */
export function logDeviceData(device) {
  console.log(`\n┌─────────────────────────────────────────────────────────────`);
  console.log(`│ 📊 ${device.name.toUpperCase()} (ID: ${device.slaveId})`);
  console.log(`├─────────────────────────────────────────────────────────────`);
  
  // Проходим по всем категориям
  for (const [category, params] of Object.entries(device.data)) {
    // Определяем иконку для категории
    const categoryIcon = getCategoryIcon(category);
    
    console.log(`│`);
    console.log(`│ ${categoryIcon} ${category.toUpperCase()}:`);
    
    // Выводим параметры категории
    for (const [key, data] of Object.entries(params)) {
      const valueStr = formatValue(data);
      console.log(`│   • ${key}: ${valueStr}`);
    }
  }
  
  console.log(`└─────────────────────────────────────────────────────────────\n`);
  console.log(`⏰ ${new Date().toLocaleString('ru-RU')}`);

}

/**
 * Получает иконку для категории
 * @param {string} category - Название категории
 * @returns {string} Иконка
 */
function getCategoryIcon(category) {
  const icons = {
    'alarms': '🚨',
    'info': 'ℹ️',
    'parameters': '📈',
    'im': '⚙️',
    'setpoints': '🎯',
    'status': '📡'
  };
  
  return icons[category] || '📁';
}

/**
 * Форматирует значение параметра для вывода
 * @param {Object} data - Данные параметра
 * @returns {string} Отформатированная строка
 */
function formatValue(data) {
  if (typeof data.value === 'boolean') {
    // Булевы значения
    return data.value ? '✅ true' : '❌ false';
  }
  
  // Числовые значения
  let result = `${data.value}`;
  
  if (data.unit) {
    result += ` ${data.unit}`;
  }
  
  // Добавляем индикатор аварии
  if (data.isAlarm !== undefined) {
    result += data.isAlarm ? ' ⚠️ ALARM' : ' ✓';
  }
  
  return result;
}

/**
 * Компактный вывод данных (одной строкой для каждого устройства)
 * @param {Object} device - Устройство с данными
 */
export function logDeviceDataCompact(device) {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  const alarmsCount = countAlarms(device.data);
  const statusIcon = alarmsCount > 0 ? '⚠️' : '✅';
  
  console.log(`${statusIcon} [${timestamp}] ${device.name} | Аварии: ${alarmsCount}`);
}

/**
 * Подсчитывает количество активных аварий
 * @param {Object} data - Данные устройства
 * @returns {number} Количество аварий
 */
function countAlarms(data) {
  let count = 0;
  
  // Считаем аварии из категории alarms
  if (data.alarms) {
    for (const param of Object.values(data.alarms)) {
      if (param.value === true) {
        count++;
      }
    }
  }
  
  // Считаем параметры с isAlarm = true
  for (const category of Object.values(data)) {
    for (const param of Object.values(category)) {
      if (param.isAlarm === true) {
        count++;
      }
    }
  }
  
  return count;
}

