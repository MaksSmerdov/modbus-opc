import type { Port } from '@/features/settings/port/types';

/**
 * Форматирует информацию о порте для отображения
 */
export function formatPortInfo(port: Port): string {
    if (port.connectionType === 'RTU') {
        return port.port;
    } else {
        return `${port.host}:${port.tcpPort}`;
    }
}

/**
 * Форматирует количество устройств с правильным склонением
 */
export function formatDevicesCount(count: number): string {
    if (count === 0) {
        return '';
    }
    
    let word: string;
    if (count === 1) {
        word = 'уст-во';
    } else if (count < 5) {
        word = 'уст-ва';
    } else {
        word = 'уст-в';
    }
    
    return `[${count} ${word}]`;
}

/**
 * Подсчитывает количество устройств для каждого порта
 */
export function countDevicesByPort(
    ports: Port[] | undefined,
    devices: Array<{ portId: string }> | undefined
): Record<string, number> {
    if (!devices || !ports) {
        return {};
    }
    
    const countMap: Record<string, number> = {};
    ports.forEach((port) => {
        countMap[port._id] = devices.filter((device) => device.portId === port._id).length;
    });
    
    return countMap;
}

/**
 * Получает текст подсказки для кнопки редактирования порта
 */
export function getEditTooltip(isEditDeleteDisabled: boolean): string {
    if (isEditDeleteDisabled) {
        return 'Сначала выключите порт, чтобы редактировать его';
    }
    return 'Редактировать';
}

/**
 * Получает текст подсказки для кнопки удаления порта
 */
export function getDeleteTooltip(isEditDeleteDisabled: boolean): string {
    if (isEditDeleteDisabled) {
        return 'Сначала выключите порт, чтобы удалить его';
    }
    return 'Удалить';
}

