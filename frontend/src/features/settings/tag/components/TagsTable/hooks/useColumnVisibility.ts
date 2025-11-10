import { useMemo } from 'react';
import type { Tag } from '../../../types';
import { shouldShowByteOrder } from '../utils/tagsTableUtils';

interface EditingRow {
    id: string | 'new';
    data: Partial<{
        dataType: Tag['dataType'];
    }>;
}

interface ColumnVisibility {
    hasStringTags: boolean;
    hasBitsTags: boolean;
    hasMultiByteTags: boolean;
}

export const useColumnVisibility = (
    tags: Tag[],
    editingRow: EditingRow | null,
    canEdit: boolean
): ColumnVisibility => {
    return useMemo(() => {
        // Собираем все типы данных для проверки
        const dataTypes: Tag['dataType'][] = [];

        // Добавляем типы из существующих тэгов
        tags.forEach(tag => {
            const isEditing = editingRow && editingRow.id === tag._id;
            const dataType = isEditing && editingRow.data.dataType
                ? editingRow.data.dataType
                : tag.dataType;
            dataTypes.push(dataType);
        });

        // Добавляем тип из новой строки, если она редактируется
        if (editingRow?.id === 'new' && editingRow.data.dataType) {
            dataTypes.push(editingRow.data.dataType);
        }

        const hasString = dataTypes.some(t => t === 'string');
        const hasBits = dataTypes.some(t => t === 'bits');
        const hasMultiByte = canEdit || dataTypes.some(t => shouldShowByteOrder(t));

        return {
            hasStringTags: hasString,
            hasBitsTags: hasBits,
            hasMultiByteTags: hasMultiByte,
        };
    }, [tags, editingRow, canEdit]);
};

