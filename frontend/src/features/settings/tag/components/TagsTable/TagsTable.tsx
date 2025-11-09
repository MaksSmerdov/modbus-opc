import { useState, useMemo, useCallback } from 'react';
import { useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation } from '../../api/tagsApi';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import { TagDetailsModal } from '../TagDetailsModal/TagDetailsModal';
import { ByteOrderModal } from '../ByteOrderModal/ByteOrderModal';
import { TagsTableToolbar } from './TagsTableToolbar';
import { TagsTableNewRow } from './TagsTableNewRow';
import { TagsTableRow } from './TagsTableRow';
import { shouldShowByteOrder, getDefaultLength } from './utils/tagsTableUtils';
import type { Tag, CreateTagData, UpdateTagData, ByteOrder } from '../../types';
import styles from './TagsTable.module.scss';

interface TagsTableProps {
    deviceId: string;
    tags: Tag[];
    canEdit?: boolean;
}

interface EditingRow {
    id: string | 'new';
    data: Partial<CreateTagData>;
}

export const TagsTable = ({ deviceId, tags, canEdit = false }: TagsTableProps) => {
    const { showSuccess, showError } = useSnackbar();
    const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
    const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
    const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();
    const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [byteOrderModalOpen, setByteOrderModalOpen] = useState(false);

    const handleAddRow = useCallback(() => {
        setEditingRow({
            id: 'new',
            data: {
                address: 0,
                name: '',
                dataType: 'int16',
                functionCode: 'holding',
                byteOrder: 'ABCD', // По умолчанию ABCD
                scale: 1,
                offset: 0,
                decimals: 0, // По умолчанию на бэке 0
            },
        });
    }, []);

    const handleEditRow = useCallback((tag: Tag) => {
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

    const handleOpenDetails = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setDetailsModalOpen(true);
    }, []);

    const handleSaveDetails = useCallback(async (data: UpdateTagData) => {
        if (!selectedTag) return;
        try {
            await updateTag({ deviceId, tagId: selectedTag._id, data }).unwrap();
            showSuccess('Дополнительные параметры успешно обновлены');
        } catch (error) {
            console.error('Ошибка обновления параметров:', error);
            showError('Не удалось обновить параметры');
            throw error;
        }
    }, [selectedTag, deviceId, updateTag, showSuccess, showError]);

    const handleCancelEdit = useCallback(() => {
        setEditingRow(null);
    }, []);

    const handleCloseDetailsModal = useCallback(() => {
        setDetailsModalOpen(false);
        setSelectedTag(null);
    }, []);

    const handleOpenByteOrderModal = useCallback(() => {
        setByteOrderModalOpen(true);
    }, []);

    const handleCloseByteOrderModal = useCallback(() => {
        setByteOrderModalOpen(false);
    }, []);

    const handleSaveByteOrder = useCallback((byteOrder: ByteOrder) => {
        if (!editingRow) return;
        setEditingRow({
            ...editingRow,
            data: {
                ...editingRow.data,
                byteOrder,
            },
        });
        setByteOrderModalOpen(false);
    }, [editingRow]);

    const handleSaveRow = useCallback(async () => {
        if (!editingRow) return;

        try {
            if (editingRow.id === 'new') {
                // Создание нового тэга
                const dataType = editingRow.data.dataType ?? 'int16';

                // Валидация обязательных полей
                if (!editingRow.data.name) {
                    showError('Название тэга обязательно');
                    return;
                }
                if (dataType === 'string' && !editingRow.data.length) {
                    showError('Длина обязательна для типа string');
                    return;
                }
                if (dataType === 'bits' && (editingRow.data.bitIndex === null || editingRow.data.bitIndex === undefined)) {
                    showError('Bit Index обязателен для типа bits');
                    return;
                }

                // Формируем данные для создания тэга (без deviceId - он передается в URL)
                const tagData: Omit<CreateTagData, 'deviceId'> = {
                    address: editingRow.data.address ?? 0,
                    name: editingRow.data.name ?? '',
                    dataType,
                    // length обязателен всегда, для string берем из формы, для остальных вычисляем
                    length: dataType === 'string'
                        ? (editingRow.data.length ?? 1)
                        : (editingRow.data.length ?? getDefaultLength(dataType)),
                    // functionCode обязателен, передаем явно (на бэке default: 'holding')
                    functionCode: editingRow.data.functionCode ?? 'holding',
                    // category необязателен, но передаем если есть (на бэке default: 'general')
                    ...(editingRow.data.category && { category: editingRow.data.category }),
                    // bitIndex обязателен для bits, для остальных должен быть null
                    ...(dataType === 'bits' && editingRow.data.bitIndex !== null && editingRow.data.bitIndex !== undefined && { bitIndex: editingRow.data.bitIndex }),
                    ...(dataType !== 'bits' && { bitIndex: null }),
                    // byteOrder только для многобайтовых типов
                    ...(shouldShowByteOrder(dataType) && editingRow.data.byteOrder && { byteOrder: editingRow.data.byteOrder }),
                    // scale и offset всегда передаем (на бэке default: scale = 1, offset = 0)
                    scale: editingRow.data.scale ?? 1,
                    offset: editingRow.data.offset ?? 0,
                    // decimals необязателен (на бэке default: 0)
                    decimals: editingRow.data.decimals ?? 0,
                    // unit необязателен (на бэке default: '')
                    ...(editingRow.data.unit && { unit: editingRow.data.unit }),
                };
                await createTag({ deviceId, data: tagData }).unwrap();
                showSuccess('Тэг успешно создан');
            } else {
                // Обновление существующего тэга
                const dataType = editingRow.data.dataType;

                // Формируем данные для обновления тэга (без deviceId - он передается в URL)
                const updateData: Omit<UpdateTagData, 'deviceId'> = {
                    ...(editingRow.data.address !== undefined && { address: editingRow.data.address }),
                    ...(editingRow.data.name !== undefined && { name: editingRow.data.name }),
                    ...(editingRow.data.category !== undefined && { category: editingRow.data.category }),
                    ...(editingRow.data.functionCode !== undefined && { functionCode: editingRow.data.functionCode }),
                    ...(dataType !== undefined && { dataType }),
                    // length обязателен всегда, для string берем из формы, для остальных вычисляем если не указан
                    ...(dataType && {
                        length: dataType === 'string'
                            ? (editingRow.data.length ?? 1)
                            : (editingRow.data.length ?? getDefaultLength(dataType))
                    }),
                    // bitIndex обязателен для bits, для остальных должен быть null
                    ...(dataType && dataType === 'bits' && editingRow.data.bitIndex !== null && editingRow.data.bitIndex !== undefined && { bitIndex: editingRow.data.bitIndex }),
                    ...(dataType && dataType !== 'bits' && { bitIndex: null }),
                    // byteOrder только для многобайтовых типов
                    ...(dataType && shouldShowByteOrder(dataType) && editingRow.data.byteOrder !== undefined && { byteOrder: editingRow.data.byteOrder }),
                    // scale и offset всегда передаем при обновлении (если указаны)
                    ...(editingRow.data.scale !== undefined && { scale: editingRow.data.scale }),
                    ...(editingRow.data.offset !== undefined && { offset: editingRow.data.offset }),
                    // decimals передаем если указан
                    ...(editingRow.data.decimals !== undefined && { decimals: editingRow.data.decimals }),
                    // unit передаем если указан
                    ...(editingRow.data.unit !== undefined && { unit: editingRow.data.unit }),
                };
                await updateTag({ deviceId, tagId: editingRow.id, data: updateData }).unwrap();
                showSuccess('Тэг успешно обновлен');
            }
            setEditingRow(null);
        } catch (error) {
            console.error('Ошибка сохранения тэга:', error);
            showError(editingRow.id === 'new' ? 'Не удалось создать тэг' : 'Не удалось обновить тэг');
        }
    }, [editingRow, createTag, updateTag, showSuccess, showError, deviceId]);

    const handleDeleteRow = useCallback(async (tagId: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот тэг?')) return;

        try {
            await deleteTag({ deviceId, tagId }).unwrap();
            showSuccess('Тэг успешно удален');
        } catch (error) {
            console.error('Ошибка удаления тэга:', error);
            showError('Не удалось удалить тэг');
        }
    }, [deviceId, deleteTag, showSuccess, showError]);

    const updateEditingField = useCallback((field: keyof CreateTagData, value: unknown) => {
        if (!editingRow) return;

        // При изменении типа данных сбрасываем неиспользуемые поля
        if (field === 'dataType') {
            const newDataType = value as CreateTagData['dataType'];
            const updatedData: Partial<CreateTagData> = {
                ...editingRow.data,
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

            setEditingRow({
                ...editingRow,
                data: updatedData,
            });
        } else {
            setEditingRow({
                ...editingRow,
                data: {
                    ...editingRow.data,
                    [field]: value,
                },
            });
        }
    }, [editingRow]);

    // Определяем видимость колонок
    const { hasStringTags, hasBitsTags, hasMultiByteTags } = useMemo(() => {
        const hasString = tags.some(t => {
            const isEditing = editingRow && editingRow.id === t._id;
            const dataType = isEditing && editingRow.data.dataType ? editingRow.data.dataType : t.dataType;
            return dataType === 'string';
        }) || (editingRow?.id === 'new' && editingRow.data.dataType === 'string');

        const hasBits = tags.some(t => {
            const isEditing = editingRow && editingRow.id === t._id;
            const dataType = isEditing && editingRow.data.dataType ? editingRow.data.dataType : t.dataType;
            return dataType === 'bits';
        }) || (editingRow?.id === 'new' && editingRow.data.dataType === 'bits');

        // Колонка Byte Order всегда показывается в режиме редактирования
        const hasMultiByte = canEdit || tags.some(t => {
            const isEditing = editingRow && editingRow.id === t._id;
            const dataType = isEditing && editingRow.data.dataType ? editingRow.data.dataType : t.dataType;
            return shouldShowByteOrder(dataType);
        }) || (editingRow?.id === 'new' && editingRow.data.dataType ? shouldShowByteOrder(editingRow.data.dataType) : false);

        return { hasStringTags: hasString, hasBitsTags: hasBits, hasMultiByteTags: hasMultiByte };
    }, [tags, editingRow, canEdit]);

    return (
        <>
            <div className={styles['tagsTable']}>
                {canEdit && (
                    <TagsTableToolbar
                        onAdd={handleAddRow}
                        disabled={editingRow !== null || isCreating}
                    />
                )}
                <div className={styles['tagsTable__wrapper']}>
                    <table className={styles['tagsTable__table']}>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Адрес</th>
                                <th>Категория</th>
                                <th>Function Code</th>
                                <th>Тип данных</th>
                                {hasStringTags && <th>Длина</th>}
                                {hasBitsTags && <th>Индекс битов</th>}
                                {hasMultiByteTags && <th>Порядок байтов</th>}
                                <th>Ед. изм.</th>
                                {canEdit && <th>Действия</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {editingRow?.id === 'new' && (
                                <TagsTableNewRow
                                    editingData={editingRow.data}
                                    hasStringTags={hasStringTags}
                                    hasBitsTags={hasBitsTags}
                                    hasMultiByteTags={hasMultiByteTags}
                                    onFieldChange={updateEditingField}
                                    onSave={handleSaveRow}
                                    onCancel={handleCancelEdit}
                                    onByteOrderClick={handleOpenByteOrderModal}
                                    isLoading={isCreating}
                                />
                            )}
                            {tags.map((tag) => {
                                const handleEdit = () => handleEditRow(tag);
                                const handleDelete = () => handleDeleteRow(tag._id);
                                const handleDetails = () => handleOpenDetails(tag);

                                return (
                                    <TagsTableRow
                                        key={tag._id}
                                        tag={tag}
                                        isEditing={editingRow?.id === tag._id}
                                        editingData={editingRow?.id === tag._id ? editingRow.data : undefined}
                                        hasStringTags={hasStringTags}
                                        hasBitsTags={hasBitsTags}
                                        hasMultiByteTags={hasMultiByteTags}
                                        canEdit={canEdit}
                                        onFieldChange={updateEditingField}
                                        onByteOrderClick={editingRow?.id === tag._id ? handleOpenByteOrderModal : undefined}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onSave={handleSaveRow}
                                        onCancel={handleCancelEdit}
                                        onDetails={handleDetails}
                                        isSaving={isUpdating}
                                        isDeleting={isDeleting}
                                        disabled={editingRow !== null}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <TagDetailsModal
                open={detailsModalOpen}
                onClose={handleCloseDetailsModal}
                tag={selectedTag}
                onSave={handleSaveDetails}
                isLoading={isUpdating}
            />
            {editingRow && (
                <ByteOrderModal
                    open={byteOrderModalOpen}
                    onClose={handleCloseByteOrderModal}
                    currentValue={editingRow.data.byteOrder ?? 'ABCD'}
                    onSave={handleSaveByteOrder}
                />
            )}
        </>
    );
};