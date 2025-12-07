import { useState, useCallback, useRef } from 'react';
import { useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation } from '@/features/settings/tag/api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { validateTagData, normalizeCreateTagData, normalizeUpdateTagData } from '@/features/settings/tag/components/TagsTable/utils/tagFormUtils';
import type { Tag, CreateTagData } from '@/features/settings/tag/types';

interface EditingRow {
    id: string | 'new';
    data: Partial<CreateTagData>;
}

export const useTagEditing = (deviceId: string) => {
    const { showSuccess, showError } = useSnackbar();
    const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
    const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
    const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();
    const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
    // Сохраняем исходный тип данных тэга для правильной нормализации при обновлении
    const originalDataTypeRef = useRef<Record<string, string>>({});

    const handleSave = useCallback(async () => {
        if (!editingRow) return;

        const validationError = validateTagData(editingRow.data);
        if (validationError) {
            showError(validationError);
            return;
        }

        try {
            if (editingRow.id === 'new') {
                const tagData = normalizeCreateTagData(editingRow.data);
                await createTag({ deviceId, data: tagData }).unwrap();
                showSuccess('Тэг успешно создан');
            } else {
                const originalDataType = originalDataTypeRef.current[editingRow.id];
                const updateData = normalizeUpdateTagData(editingRow.data, originalDataType);
                await updateTag({ deviceId, tagId: editingRow.id, data: updateData }).unwrap();
                showSuccess('Тэг успешно обновлен');
            }
            setEditingRow(null);
        } catch (error) {
            console.error('Ошибка сохранения тэга:', error);
            showError(editingRow.id === 'new' ? 'Не удалось создать тэг' : 'Не удалось обновить тэг');
        }
    }, [editingRow, deviceId, createTag, updateTag, showSuccess, showError]);

    const handleDelete = useCallback(async (tagId: string) => {
        try {
            await deleteTag({ deviceId, tagId }).unwrap();
            showSuccess('Тэг успешно удален');
        } catch (error) {
            console.error('Ошибка удаления тэга:', error);
            showError('Не удалось удалить тэг');
        }
    }, [deviceId, deleteTag, showSuccess, showError]);

    const startEditing = useCallback((tag: Tag) => {
        // Сохраняем исходный тип данных для правильной нормализации при обновлении
        originalDataTypeRef.current[tag._id] = tag.dataType;
        setEditingRow({
            id: tag._id,
            data: {
                address: tag.address,
                name: tag.name,
                category: tag.category ?? '',
                functionCode: tag.functionCode ?? 'holding',
                dataType: tag.dataType,
                length: tag.length,
                bitIndex: tag.bitIndex ?? null,
                byteOrder: tag.byteOrder ?? 'ABCD',
                scale: tag.scale ?? 1,
                offset: tag.offset ?? 0,
                decimals: tag.decimals ?? 0,
                unit: tag.unit ?? '',
            },
        });
    }, []);

    const startCreating = useCallback(() => {
        setEditingRow({
            id: 'new',
            data: {
                address: 0,
                name: '',
                dataType: 'int16',
                functionCode: 'holding',
                byteOrder: 'ABCD',
                scale: 1,
                offset: 0,
                decimals: 0,
            },
        });
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingRow(null);
    }, []);

    return {
        editingRow,
        setEditingRow,
        handleSave,
        handleDelete,
        startEditing,
        startCreating,
        cancelEditing,
        isCreating,
        isUpdating,
        isDeleting,
    };
};

