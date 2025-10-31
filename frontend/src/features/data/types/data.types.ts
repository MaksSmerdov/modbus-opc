/**
 * Типы для модуля данных устройств
 */

/**
 * Значение параметра с единицей измерения
 */
export interface ParameterValue {
  value: number | string | boolean;
  unit?: string;
}

/**
 * Данные устройства, сгруппированные по категориям
 */
export interface DeviceData {
  [category: string]: {
    [parameterName: string]: ParameterValue;
  };
}

/**
 * Real-time данные устройства
 */
export interface DeviceRealTimeData {
  name: string;
  slaveId: number;
  lastUpdated: string;
  isResponding: boolean;
  data: DeviceData | null;
}

/**
 * Список всех устройств с real-time данными
 */
export type DevicesRealTimeData = DeviceRealTimeData[];

/**
 * Историческая запись устройства
 */
export interface DeviceHistoryRecord {
  _id: string;
  slaveId: number;
  data: DeviceData;
  date: string;
  timestamp: string;
}

/**
 * Ответ с историческими данными
 */
export interface DeviceHistoryResponse {
  deviceName: string;
  count: number;
  data: DeviceHistoryRecord[];
}

/**
 * Параметры запроса истории
 */
export interface HistoryQueryParams {
  limit?: number;
  from?: string;
  to?: string;
}

