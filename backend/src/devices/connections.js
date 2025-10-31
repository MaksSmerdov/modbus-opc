/**
 * Профили подключений для Modbus устройств
 * 
 * Каждый профиль описывает параметры подключения:
 * - connectionType: 'RTU' или 'TCP'
 * - для RTU: port, baudRate, dataBits, stopBits, parity
 * - для TCP: host, port
 * - timeout: таймаут ответа устройства (мс)
 * - retries: количество попыток перед пропуском
 */

export const connectionProfiles = {
  // RTU профиль для COM16
  rtu_com16_57600: {
    connectionType: 'RTU',
    port: 'COM16',
    baudRate: 57600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    timeout: 500,
    retries: 3
  },

  // TCP профиль (пример)
  // tcp_localhost: {
  //   connectionType: 'TCP',
  //   host: 'localhost',
  //   port: 502,
  //   timeout: 3000,
  //   retries: 3
  // }
};

