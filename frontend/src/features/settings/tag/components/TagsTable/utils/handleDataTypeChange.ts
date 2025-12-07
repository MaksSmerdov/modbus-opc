import { shouldShowByteOrder, getDefaultLength } from './tagsTableUtils';
import type { CreateTagData } from '@/features/settings/tag/types';

export const handleDataTypeChange = (
    newDataType: CreateTagData['dataType'],
    currentData: Partial<CreateTagData>
): Partial<CreateTagData> => {
    const updatedData: Partial<CreateTagData> = {
        ...currentData,
        dataType: newDataType,
    };

    // Сбрасываем bitIndex если тип не bits
    if (newDataType !== 'bits') {
        updatedData.bitIndex = null;
    }

    // byteOrder по умолчанию ABCD для многобайтовых типов
    if (shouldShowByteOrder(newDataType) && !updatedData.byteOrder) {
        updatedData.byteOrder = 'ABCD';
    }

    // Вычисляем length для типов с фиксированной длиной
    if (newDataType !== 'string') {
        updatedData.length = getDefaultLength(newDataType);
    }

    return updatedData;
};