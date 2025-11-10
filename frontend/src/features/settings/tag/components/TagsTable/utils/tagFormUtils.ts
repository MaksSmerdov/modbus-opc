import type { CreateTagData, UpdateTagData } from '../../../types';
import { shouldShowByteOrder, getDefaultLength } from './tagsTableUtils';

/**
 * Валидация данных тэга перед сохранением
 */
export const validateTagData = (data: Partial<CreateTagData>): string | null => {
    if (!data.name) {
        return 'Название тэга обязательно';
    }
    if (data.dataType === 'string' && !data.length) {
        return 'Длина обязательна для типа string';
    }
    if (data.dataType === 'bits' && (data.bitIndex === null || data.bitIndex === undefined)) {
        return 'Bit Index обязателен для типа bits';
    }
    return null;
};

/**
 * Нормализация данных для создания тэга
 */
export const normalizeCreateTagData = (data: Partial<CreateTagData>): Omit<CreateTagData, 'deviceId'> => {
    const dataType = data.dataType ?? 'int16';

    return {
        address: data.address ?? 0,
        name: data.name ?? '',
        dataType,
        length: dataType === 'string'
            ? (data.length ?? 1)
            : (data.length ?? getDefaultLength(dataType)),
        functionCode: data.functionCode ?? 'holding',
        ...(data.category && { category: data.category }),
        ...(dataType === 'bits' && data.bitIndex !== null && data.bitIndex !== undefined && { bitIndex: data.bitIndex }),
        ...(dataType !== 'bits' && { bitIndex: null }),
        ...(shouldShowByteOrder(dataType) && data.byteOrder && { byteOrder: data.byteOrder }),
        scale: data.scale ?? 1,
        offset: data.offset ?? 0,
        decimals: data.decimals ?? 0,
        ...(data.unit && { unit: data.unit }),
    };
};

/**
 * Нормализация данных для обновления тэга
 */
export const normalizeUpdateTagData = (
    data: Partial<CreateTagData>,
    originalDataType?: string
): Omit<UpdateTagData, 'deviceId'> => {
    const dataType = data.dataType ?? originalDataType;

    return {
        ...(data.address !== undefined && { address: data.address }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.functionCode !== undefined && { functionCode: data.functionCode }),
        ...(data.dataType !== undefined && { dataType: data.dataType }),
        ...(dataType && {
            length: dataType === 'string'
                ? (data.length ?? 1)
                : (data.length ?? getDefaultLength(dataType))
        }),
        ...(dataType && dataType === 'bits' && data.bitIndex !== null && data.bitIndex !== undefined && { bitIndex: data.bitIndex }),
        ...(dataType && dataType !== 'bits' && { bitIndex: null }),
        // byteOrder включаем если он определен, независимо от dataType (бэкенд сам проверит валидность)
        ...(data.byteOrder !== undefined && { byteOrder: data.byteOrder }),
        ...(data.scale !== undefined && { scale: data.scale }),
        ...(data.offset !== undefined && { offset: data.offset }),
        ...(data.decimals !== undefined && { decimals: data.decimals }),
        ...(data.unit !== undefined && { unit: data.unit }),
    };
};

