/**
 * Утилита для вывода данных устройств в консоль
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

function formatValue(data) {
  if (typeof data.value === 'boolean') {
    return data.value ? '✅ true' : '❌ false';
  }
  
  let result = `${data.value}`;
  
  if (data.unit) {
    result += ` ${data.unit}`;
  }
  
  if (data.isAlarm !== undefined) {
    result += data.isAlarm ? ' ⚠️ ALARM' : ' ✓';
  }
  
  return result;
}