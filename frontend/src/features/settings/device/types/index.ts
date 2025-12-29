export interface Device {
    _id: string;
    name: string;
    slug: string;
    slaveId: number;
    portId: string;
    timeout: number;
    retries: number;
    saveInterval: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Данные для создания устройства
export interface CreateDeviceData {
    name: string;
    slug?: string;
    slaveId: number;
    portId: string;
    timeout?: number; 
    retries?: number; 
    saveInterval?: number; 
    isActive?: boolean;
}

// Данные для обновления устройства (все поля опциональны)
export type UpdateDeviceData = Partial<CreateDeviceData>;

// Ответ API при получении списка устройств
export interface DevicesListResponse {
    success: true;
    count: number;
    data: Device[];
}

// Ответ API при получении одного устройства
export interface DeviceResponse {
    success: true;
    data: Device;
}