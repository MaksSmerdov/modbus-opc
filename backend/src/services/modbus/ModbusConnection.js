import ModbusRTU from 'modbus-serial';

/**
 * Класс для управления подключением к Modbus
 */
class ModbusConnection {
  constructor(config = {}) {
    this.client = new ModbusRTU();
    this.connectionType = config.connectionType || 'RTU';
    this.port = config.port || 'COM1';
    this.baudRate = config.baudRate || 9600;
    this.dataBits = config.dataBits || 8;
    this.stopBits = config.stopBits || 1;
    this.parity = config.parity || 'none';
    this.tcpHost = config.tcpHost || '127.0.0.1';
    this.tcpPort = config.tcpPort || 502;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.connectionType === 'RTU') {
        await this.client.connectRTUBuffered(this.port, {
          baudRate: this.baudRate,
          dataBits: this.dataBits,
          stopBits: this.stopBits,
          parity: this.parity,
        });
        console.log(`✓ Подключено к порту ${this.port} (Modbus RTU)`);
      } else if (this.connectionType === 'TCP') {
        await this.client.connectTCP(this.tcpHost, { port: this.tcpPort });
        console.log(`✓ Подключено к ${this.tcpHost}:${this.tcpPort} (Modbus TCP)`);
      } else if (this.connectionType === 'TCP_RTU') {
        await this.client.connectTelnet(this.tcpHost, { port: this.tcpPort });
        console.log(`✓ Подключено к ${this.tcpHost}:${this.tcpPort} (Modbus RTU over TCP)`);
      } else {
        throw new Error(`Неизвестный тип подключения: ${this.connectionType}`);
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client.isOpen) {
        await this.client.close();
      }
      this.isConnected = false;
      console.log('✓ Modbus подключение закрыто');
    } catch (error) {
      console.error('✗ Ошибка при отключении:', error.message);
    }
  }
}

export default ModbusConnection;
