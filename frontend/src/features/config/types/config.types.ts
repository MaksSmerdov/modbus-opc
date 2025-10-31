import type { BaseEntity } from '@/shared/types/common.types';

/**
 * Типы для модуля конфигурации
 */

// ============ Connection Profile ============

export type ConnectionType = 'RTU' | 'TCP';
export type BaudRate = 9600 | 19200 | 38400 | 57600 | 115200;
export type DataBits = 7 | 8;
export type StopBits = 1 | 2;
export type Parity = 'none' | 'even' | 'odd';

/**
 * Профиль подключения (группа устройств)
 */
export interface ConnectionProfile extends BaseEntity {
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
 * Данные для создания профиля (без _id и timestamps)
 */
export type CreateConnectionProfileDto = Omit<ConnectionProfile, keyof BaseEntity>;

/**
 * Данные для обновления профиля
 */
export type UpdateConnectionProfileDto = Partial<CreateConnectionProfileDto>;

// ============ Register ============

export type FunctionCode = 'holding' | 'input' | 'coil' | 'discrete';
export type DataType = 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'string' | 'bits';
export type ByteOrder = 'BE' | 'LE' | 'ABCD' | 'CDAB' | 'BADC' | 'DCBA';

/**
 * Регистр Modbus
 */
export interface Register {
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
 * Данные для создания регистра
 */
export type CreateRegisterDto = Omit<Register, 'length'> & {
  length?: number; // может быть вычислен автоматически
};

// ============ Register Template ============

/**
 * Шаблон регистров
 */
export interface RegisterTemplate extends BaseEntity {
  name: string;
  deviceType: string;
  registers: Register[];
}

/**
 * Данные для создания шаблона
 */
export type CreateRegisterTemplateDto = Omit<RegisterTemplate, keyof BaseEntity>;

/**
 * Данные для обновления шаблона
 */
export type UpdateRegisterTemplateDto = Partial<CreateRegisterTemplateDto>;

// ============ Device ============

/**
 * Устройство
 */
export interface Device extends BaseEntity {
  name: string;
  slaveId: number;
  connectionProfileId: string | ConnectionProfile;
  registerTemplateId: string | RegisterTemplate;
  saveInterval: number;
  logData: boolean;
  isActive: boolean;
}

/**
 * Устройство с заполненными связями (populate)
 */
export interface DevicePopulated extends Omit<Device, 'connectionProfileId' | 'registerTemplateId'> {
  connectionProfileId: ConnectionProfile;
  registerTemplateId: RegisterTemplate;
}

/**
 * Данные для создания устройства
 */
export type CreateDeviceDto = Omit<Device, keyof BaseEntity | 'connectionProfileId' | 'registerTemplateId'> & {
  connectionProfileId: string;
  registerTemplateId: string;
};

/**
 * Данные для обновления устройства
 */
export type UpdateDeviceDto = Partial<CreateDeviceDto>;

