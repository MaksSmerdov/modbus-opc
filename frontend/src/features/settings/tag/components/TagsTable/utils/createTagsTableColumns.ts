import type { TableColumn } from '@/shared/ui/Table/Table';

interface ColumnVisibility {
    hasStringTags: boolean;
    hasBitsTags: boolean;
    hasMultiByteTags: boolean;
}

export const createTagsTableColumns = (
    columnVisibility: ColumnVisibility,
    canEdit: boolean
): TableColumn[] => {
    const baseColumns: TableColumn[] = [
        { key: 'name', label: 'Название', width: '25%' },
        { key: 'address', label: 'Адрес', width: '12%' },
        { key: 'functionCode', label: 'Function Code', width: '10%' },
        { key: 'dataType', label: 'Тип данных', width: '10%' },
    ];

    if (columnVisibility.hasStringTags) {
        baseColumns.push({ key: 'length', label: 'Длина', width: '8%' });
    }

    if (columnVisibility.hasBitsTags) {
        baseColumns.push({ key: 'bitIndex', label: 'Индекс битов', width: '8%' });
    }

    if (columnVisibility.hasMultiByteTags) {
        baseColumns.push({ key: 'byteOrder', label: 'Порядок байтов', width: '10%' });
    }

    baseColumns.push({ key: 'unit', label: 'Ед. изм.', width: '8%' });

    if (canEdit) {
        baseColumns.push({ key: 'actions', label: 'Действия', width: '10%' });
    }

    return baseColumns;
};