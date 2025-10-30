/**
 * Форматирует дату в читаемый формат
 * @param {Date} date - Дата для форматирования
 * @returns {string} Форматированная дата в формате "ДД.ММ.ГГГГ ЧЧ:ММ:СС"
 */
export function formatDate(date = new Date()) {
  const pad = (num) => String(num).padStart(2, '0');
  
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

