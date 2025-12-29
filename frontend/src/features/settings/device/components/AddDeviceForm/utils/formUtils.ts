import type { CreateDeviceData } from '@/features/settings/device/types';
import type { DeviceFormData } from '@/features/settings/device/components/AddDeviceForm/deviceSchemas';
import { transliterate } from '@/shared/utils/transliterate';

/**
 * Получает значения по умолчанию для формы устройства
 */
export function getDefaultDeviceFormValues(
    portId: string,
    initialData?: CreateDeviceData
): Partial<DeviceFormData> {
    return {
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        slaveId: initialData?.slaveId || 1,
        portId: portId,
        timeout: initialData?.timeout || 500,
        retries: initialData?.retries || 3,
        saveInterval: initialData?.saveInterval || 30000,
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    };
}

/**
 * Генерирует slug из названия устройства
 */
export function generateSlugFromName(name: string): string {
    return transliterate(name).toLowerCase().replace(/[^a-z0-9-_]/g, '-');
}

/**
 * Получает helperText для поля slug
 */
export function getSlugHelperText(
    slug: string | undefined,
    hasError: boolean,
    errorMessage: string | undefined,
    isAdmin: boolean
): string | undefined {
    if (hasError && errorMessage) {
        return errorMessage;
    }
    if (slug) {
        return undefined; // Скрываем helperText когда slug заполнен
    }
    if (isAdmin) {
        return 'Опционально. Если не указан, будет сгенерирован автоматически';
    }
    return undefined; // Для не-админов поле скрыто, поэтому helperText не нужен
}

