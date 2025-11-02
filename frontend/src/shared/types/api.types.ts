// Базовые типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

// Порты
export interface PortRTU {
  name: string;
  connectionType: 'RTU';
  port: string;
  baudRate: 9600 | 19200 | 38400 | 57600 | 115200;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  isActive?: boolean;
}

export interface PortTCP {
  name: string;
  connectionType: 'TCP';
  host: string;
  tcpPort?: number;
  isActive?: boolean;
}

export type PortInput = PortRTU | PortTCP;

export interface Port extends PortInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Устройства
export interface DeviceInput {
  name: string;
  slug?: string;
  slaveId: number;
  portId: string;
  timeout?: number;
  retries?: number;
  saveInterval?: number;
  logData?: boolean;
  isActive?: boolean;
}

export interface Device extends DeviceInput {
  _id: string;
  slug: string;
  portId: string | Port;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

// Тэги
export type TagDataType = 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'string' | 'bits';
export type FunctionCode = 'holding' | 'input' | 'coil' | 'discrete';
export type ByteOrder = 'BE' | 'LE' | 'ABCD' | 'CDAB' | 'BADC' | 'DCBA';

export interface TagInput {
  address: number;
  length?: number;
  name: string;
  category?: string;
  functionCode?: FunctionCode;
  dataType: TagDataType;
  bitIndex?: number | null;
  byteOrder?: ByteOrder;
  scale?: number;
  offset?: number;
  decimals?: number;
  unit?: string;
  minValue?: number | null;
  maxValue?: number | null;
  description?: string;
}

export interface Tag extends TagInput {
  _id: string;
  deviceId: string;
  length: number;
  functionCode: FunctionCode;
  byteOrder: ByteOrder;
  scale: number;
  offset: number;
  decimals: number;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Данные устройств
export interface TagValue {
  value: number | boolean | null;
  unit?: string;
  isAlarm?: boolean;
}

export interface DeviceDataItem {
  name: string;
  slug: string;
  slaveId: number;
  lastUpdated: string | null;
  isResponding: boolean;
  data: Record<string, Record<string, TagValue>> | null;
}

export interface HistoricalDataItem {
  _id: string;
  timestamp: string;
  values: Record<string, Record<string, TagValue>>;
}

export interface HistoricalDataResponse {
  deviceName: string;
  deviceSlug: string;
  count: number;
  data: HistoricalDataItem[];
}

// Настройки сервера
export interface ServerSettings {
  isPollingEnabled: boolean;
  pollInterval: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServerSettingsInput {
  isPollingEnabled?: boolean;
  pollInterval?: number;
}

// Опрос
export interface PollingStatus {
  isPolling: boolean;
  hasManager: boolean;
  isPollingEnabled: boolean;
  pollInterval: number;
  currentPollInterval: number | null;
}

export interface PollingResponse {
  message: string;
  isPolling: boolean;
}


