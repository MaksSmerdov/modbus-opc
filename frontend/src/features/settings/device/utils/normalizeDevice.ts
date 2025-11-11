import type { Device } from '../types';

/**
 * Нормализует portId устройства: если это объект, извлекает _id, иначе возвращает как есть
 */
export function normalizeDevicePortId(device: Device): Device {
    return {
        ...device,
        portId: typeof device.portId === 'object' && device.portId !== null
            ? (device.portId as { _id: string })._id
            : device.portId,
    };
}

/**
 * Нормализует массив устройств
 */
export function normalizeDevicesPortId(devices: Device[]): Device[] {
    return devices.map(normalizeDevicePortId);
}

