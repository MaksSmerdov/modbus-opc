/**
 * Класс-заглушка для симуляции подключения
 * Имитирует интерфейс ModbusConnection для совместимости
 */
class SimulatorConnection {
  constructor(config = {}) {
    this.connectionType = config.connectionType || 'SIMULATOR';
    this.isConnected = false;
  }

  async connect() {
    try {
      this.isConnected = true;
      console.log(`✓ Симулятор подключен (режим разработки)`);
      return true;
    } catch (error) {
      console.error('✗ Ошибка подключения симулятора:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      this.isConnected = false;
      console.log('✓ Симулятор отключен');
    } catch (error) {
      console.error('✗ Ошибка при отключении симулятора:', error.message);
    }
  }
}

export default SimulatorConnection;

