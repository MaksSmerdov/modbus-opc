export type ConnectionType = 'RTU' | 'TCP' | 'TCP_RTU';

export type Parity = 'none' | 'even' | 'odd';

export type BaudRate = 9600 | 19200 | 38400 | 57600 | 115200;

export type DataBits = 7 | 8;

export type StopBits = 1 | 2;

// Базовый интерфейс порта
export interface BasePort {
  _id: string;
  name: string;
  connectionType: ConnectionType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Порт RTU
export interface RTUPort extends BasePort {
  connectionType: 'RTU';
  port: string;
  baudRate: BaudRate;
  dataBits: DataBits;
  stopBits: StopBits;
  parity: Parity;
}

// Порт TCP
export interface TCPPortBase extends BasePort {
  host: string;
  tcpPort: number;
}

export interface TCPPort extends TCPPortBase {
  connectionType: 'TCP';
}

export interface TCPRTUPort extends TCPPortBase {
  connectionType: 'TCP_RTU';
}

// Объединенный тип порта
export type Port = RTUPort | TCPPort | TCPRTUPort;

// Данные для создания/обновления RTU порта
export interface CreateRTUPortData {
  name: string;
  connectionType: 'RTU';
  port: string;
  baudRate?: BaudRate;
  dataBits?: DataBits;
  stopBits?: StopBits;
  parity?: Parity;
  isActive?: boolean;
}

// Данные для создания/обновления TCP порта
export interface CreateTCPPortData {
  name: string;
  connectionType: 'TCP';
  host: string;
  tcpPort: number;
  isActive?: boolean;
}

export interface CreateTCPRTUPortData {
  name: string;
  connectionType: 'TCP_RTU';
  host: string;
  tcpPort: number;
  isActive?: boolean;
}

// Данные для создания порта (объединенный тип)
export type CreatePortData = CreateRTUPortData | CreateTCPPortData | CreateTCPRTUPortData;

// Данные для обновления порта (все поля опциональны)
export type UpdatePortData = Partial<CreatePortData>;

// Ответ API при получении списка портов
export interface PortsListResponse {
  success: true;
  count: number;
  data: Port[];
}

// Ответ API при получении одного порта
export interface PortResponse {
  success: true;
  data: Port;
}
