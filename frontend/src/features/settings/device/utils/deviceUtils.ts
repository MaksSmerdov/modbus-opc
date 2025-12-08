import type { Device } from '@/features/settings/device/types';

/**
 * Получает правильное склонение слова "тэг" для числа
 */
export function getTagsLabel(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    // Исключения для 11-14
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'тэгов';
    }

    // 1, 21, 31, 41... - "тэг"
    if (lastDigit === 1) {
        return 'тэг';
    }

    // 2-4, 22-24, 32-34... - "тэга"
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'тэга';
    }

    // 5-20, 25-30, 35-40... - "тэгов"
    return 'тэгов';
}

/**
 * Форматирует количество тегов с правильным склонением
 */
export function formatTagsCount(count: number): string {
    if (count === 0) {
        return '';
    }
    return `[${count} ${getTagsLabel(count)}]`;
}

/**
 * Форматирует интервал сохранения в секундах
 */
export function formatSaveInterval(interval: number): string {
    return `${interval / 1000} сек.`;
}

/**
 * Получает текст подсказки для кнопки редактирования устройства
 */
export function getEditTooltip(isEditDeleteDisabled: boolean): string {
    if (isEditDeleteDisabled) {
        return 'Сначала выключите устройство, чтобы редактировать его';
    }
    return 'Редактировать';
}

/**
 * Получает текст подсказки для кнопки удаления устройства
 */
export function getDeleteTooltip(isEditDeleteDisabled: boolean): string {
    if (isEditDeleteDisabled) {
        return 'Сначала выключите устройство, чтобы удалить его';
    }
    return 'Удалить';
}

/**
 * Фильтрует устройства по порту
 */
export function filterDevicesByPort(devices: Device[] | undefined, portId: string): Device[] {
    if (!devices) {
        return [];
    }
    return devices.filter((device) => device.portId === portId);
}

