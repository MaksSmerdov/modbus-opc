/**
 * Утилита для вывода данных устройств в консоль
 */

export function logDeviceData(device) {

  console.log(`📊 ${device.name.toUpperCase()} (ID: ${device.slaveId})`);

  for (const [category, params] of Object.entries(device.data)) {
    const categoryIcon = getCategoryIcon(category);
    console.log(`${categoryIcon} ${category.toUpperCase()}:`);

    const table = [];
    for (const [key, data] of Object.entries(params)) {
      let valueDisplay = data.value;
      if (typeof data.value === 'boolean') {
        valueDisplay = data.value ? '✅ true' : '❌ false';
      }
      if (data.unit) {
        valueDisplay += ` ${data.unit}`;
      }
      if (data.isAlarm !== undefined) {
        valueDisplay += data.isAlarm ? ' ⚠️ ALARM' : ' ✓';
      }
      table.push({
        'Параметр': key,
        'Значение': valueDisplay
      });
    }
    if (table.length > 0) {
      console.table(table);
    } else {
      console.log('Нет данных для отображения логов')
    }
  }
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