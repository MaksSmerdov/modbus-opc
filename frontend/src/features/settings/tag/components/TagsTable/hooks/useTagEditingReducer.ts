import { useReducer, useCallback } from 'react';
import { useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation, useCloneTagMutation } from '@/features/settings/tag/api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { validateTagData, normalizeCreateTagData, normalizeUpdateTagData } from '@/features/settings/tag/components/TagsTable/utils/tagFormUtils';
import { handleDataTypeChange } from '@/features/settings/tag/components/TagsTable/utils/handleDataTypeChange';
import { TAG_TABLE_CONFIG } from '../config';
import type { Tag, CreateTagData } from '@/features/settings/tag/types';
import type { TagEditingAction, TagEditingState } from '../types';

const initialState: TagEditingState = {
    editingRow: null,
    originalDataTypes: {},
};

const tagEditingReducer = (state: TagEditingState, action: TagEditingAction): TagEditingState => {
    switch (action.type) {
        case 'START_EDITING': {
            const { tag } = action;
            return {
                editingRow: {
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
                },
                originalDataTypes: {
                    ...state.originalDataTypes,
                    [tag._id]: tag.dataType,
                },
            };
        }
        case 'START_CREATING': {
            return {
                editingRow: {
                    id: 'new',
                    data: TAG_TABLE_CONFIG.defaultTagData,
                },
                originalDataTypes: state.originalDataTypes,
            };
        }
        case 'UPDATE_FIELD': {
            if (!state.editingRow) {
                return state;
            }
            // Специальная обработка для dataType
            if (action.field === 'dataType') {
                const updatedData = handleDataTypeChange(
                    action.value as CreateTagData['dataType'],
                    state.editingRow.data
                );
                return {
                    ...state,
                    editingRow: {
                        ...state.editingRow,
                        data: updatedData,
                    },
                };
            }
            return {
                ...state,
                editingRow: {
                    ...state.editingRow,
                    data: {
                        ...state.editingRow.data,
                        [action.field]: action.value,
                    },
                },
            };
        }
        case 'CANCEL':
        case 'SAVE_SUCCESS': {
            return {
                editingRow: null,
                originalDataTypes: state.originalDataTypes,
            };
        }
        default:
            return state;
    }
};

export const useTagEditingReducer = (deviceId: string) => {
    const { showSuccess, showError } = useSnackbar();
    const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
    const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
    const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();
    const [cloneTag, { isLoading: isCloning }] = useCloneTagMutation();

    const [state, dispatch] = useReducer(tagEditingReducer, initialState);

    const handleSave = useCallback(async () => {
        if (!state.editingRow) return;

        const validationError = validateTagData(state.editingRow.data);
        if (validationError) {
            showError(validationError);
            return;
        }

        try {
            if (state.editingRow.id === 'new') {
                const tagData = normalizeCreateTagData(state.editingRow.data);
                await createTag({ deviceId, data: tagData }).unwrap();
                showSuccess('Тэг успешно создан');
            } else {
                const originalDataType = state.originalDataTypes[state.editingRow.id];
                const updateData = normalizeUpdateTagData(state.editingRow.data, originalDataType);
                await updateTag({ deviceId, tagId: state.editingRow.id, data: updateData }).unwrap();
                showSuccess('Тэг успешно обновлен');
            }
            dispatch({ type: 'SAVE_SUCCESS' });
        } catch (error) {
            console.error('Ошибка сохранения тэга:', error);
            showError(state.editingRow.id === 'new' ? 'Не удалось создать тэг' : 'Не удалось обновить тэг');
        }
    }, [state.editingRow, state.originalDataTypes, deviceId, createTag, updateTag, showSuccess, showError]);

    const handleDelete = useCallback(async (tagId: string, silent: boolean = false) => {
        try {
            await deleteTag({ deviceId, tagId }).unwrap();
            if (!silent) {
                showSuccess('Тэг успешно удален');
            }
        } catch (error) {
            console.error('Ошибка удаления тэга:', error);
            if (!silent) {
                showError('Не удалось удалить тэг');
            }
            throw error;
        }
    }, [deviceId, deleteTag, showSuccess, showError]);

    const startEditing = useCallback((tag: Tag) => {
        dispatch({ type: 'START_EDITING', tag });
    }, []);

    const startCreating = useCallback(() => {
        dispatch({ type: 'START_CREATING' });
    }, []);

    const cancelEditing = useCallback(() => {
        dispatch({ type: 'CANCEL' });
    }, []);

    const updateField = useCallback((field: keyof CreateTagData, value: unknown) => {
        dispatch({ type: 'UPDATE_FIELD', field, value });
    }, []);

    const handleClone = useCallback(async (tagId: string, count: number = 1) => {
        try {
            // Создаем несколько копий последовательно
            for (let i = 0; i < count; i++) {
                await cloneTag({ deviceId, tagId }).unwrap();
            }
            showSuccess(`Успешно создано ${count} ${count === 1 ? 'копия' : count < 5 ? 'копии' : 'копий'} тега`);
        } catch (error) {
            console.error('Ошибка клонирования тэга:', error);
            showError('Не удалось скопировать тэг');
        }
    }, [deviceId, cloneTag, showSuccess, showError]);

    return {
        editingRow: state.editingRow,
        handleSave,
        handleDelete,
        handleClone,
        startEditing,
        startCreating,
        cancelEditing,
        updateField,
        isCreating,
        isUpdating,
        isDeleting,
        isCloning,
    };
};

