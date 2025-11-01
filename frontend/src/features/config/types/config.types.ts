import type { BaseEntity } from '@/shared/types/common.types';

/**
 * Типы для модуля конфигурации
 */

// ============ Port ============

export type ConnectionType = 'RTU' | 'TCP';
export type BaudRate = 9600 | 19200 | 38400 | 57600 | 115200;
export type DataBits = 7 | 8;
export type StopBits = 1 | 2;
export type Parity = 'none' | 'even' | 'odd';

/**
 * Порт (группа устройств на одном физическом порту)
 */
export interface Port extends BaseEntity {
  name: string;
  connectionType: ConnectionType;
  
  // RTU параметры
  port?: string;
  baudRate?: BaudRate;
  dataBits?: DataBits;
  stopBits?: StopBits;
  parity?: Parity;
  
  // TCP параметры
  host?: string;
  tcpPort?: number;
  
  // Общие параметры
  timeout: number;
  retries: number;
}

/**
 * Данные для создания порта (без _id и timestamps)
 */
export type CreatePortDto = Omit<Port, keyof BaseEntity>;

/**
 * Данные для обновления порта
 */
export type UpdatePortDto = Partial<CreatePortDto>;

// ============ Tag ============

export type FunctionCode = 'holding' | 'input' | 'coil' | 'discrete';
export type DataType = 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'string' | 'bits';
export type ByteOrder = 'BE' | 'LE' | 'ABCD' | 'CDAB' | 'BADC' | 'DCBA';

/**
 * Тэг устройства (регистр Modbus)
 */
export interface Tag extends BaseEntity {
  deviceId: string;
  address: number;
  length: number;
  name: string;
  category: string;
  functionCode: FunctionCode;
  dataType: DataType;
  bitIndex: number | null;
  byteOrder: ByteOrder;
  scale: number;
  offset: number;
  decimals: number;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  description: string;
}

/**
 * Данные для создания тэга
 */
export type CreateTagDto = Omit<Tag, keyof BaseEntity | 'deviceId'>;

/**
 * Данные для обновления тэга
 */
export type UpdateTagDto = Partial<CreateTagDto>;

// ============ Device ============

/**
 * Устройство
 */
export interface Device extends BaseEntity {
  name: string;
  slaveId: number;
  portId: string | Port;
  tags?: Tag[];
  saveInterval: number;
  logData: boolean;
  isActive: boolean;
}

/**
 * Устройство с заполненными связями (populate)
 */
export interface DevicePopulated extends Omit<Device, 'portId'> {
  portId: Port;
  tags: Tag[];
}

/**
 * Данные для создания устройства
 */
export type CreateDeviceDto = Omit<Device, keyof BaseEntity | 'portId' | 'tags'> & {
  portId: string;
};

/**
 * Данные для обновления устройства
 */
export type UpdateDeviceDto = Partial<CreateDeviceDto>;

