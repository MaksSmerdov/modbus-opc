import { useState, useCallback } from 'react';
import { useUpdateTagMutation } from '../../api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { TagDetailsModal } from '../TagDetailsModal/TagDetailsModal';
import { ByteOrderModal } from '../ByteOrderModal/ByteOrderModal';
import { TagsTableToolbar } from './TagsTableToolbar/TagsTableToolbar';
import { TagsTableRow } from './TagsTableRow/TagsTableRow';
import { useTagEditing } from './hooks/useTagEditing';
import { useColumnVisibility } from './hooks/useColumnVisibility';
import { shouldShowByteOrder, getDefaultLength } from './utils/tagsTableUtils';
import type { Tag, UpdateTagData, ByteOrder, CreateTagData } from '../../types';
import styles from './TagsTable.module.scss';

interface TagsTableProps {
    deviceId: string;
    tags: Tag[];
    canEdit?: boolean;
}

export const TagsTable = ({ deviceId, tags, canEdit = false }: TagsTableProps) => {
    const { showSuccess, showError } = useSnackbar();
    const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();

    const {
        editingRow,
        setEditingRow,
        handleSave,
        handleDelete,
        startEditing,
        startCreating,
        cancelEditing,
        isCreating,
        isUpdating: isUpdatingTag,
        isDeleting,
    } = useTagEditing(deviceId);

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [byteOrderModalOpen, setByteOrderModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<string | null>(null);

    const columnVisibility = useColumnVisibility(tags, editingRow, canEdit);

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

    const handleDeleteClick = useCallback((tagId: string) => {
        setTagToDelete(tagId);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!tagToDelete) return;
        await handleDelete(tagToDelete);
        setDeleteConfirmOpen(false);
        setTagToDelete(null);
    }, [tagToDelete, handleDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteConfirmOpen(false);
        setTagToDelete(null);
    }, []);

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
    }, [editingRow, setEditingRow]);

    const handleSaveByteOrder = useCallback((byteOrder: ByteOrder) => {
        if (!editingRow) return;
        updateEditingField('byteOrder', byteOrder);
        setByteOrderModalOpen(false);
    }, [editingRow, updateEditingField]);

    return (
        <>
            <div className={styles['tagsTable']}>
                {canEdit && (
                    <TagsTableToolbar
                        onAdd={startCreating}
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
                                {columnVisibility.hasStringTags && <th>Длина</th>}
                                {columnVisibility.hasBitsTags && <th>Индекс битов</th>}
                                {columnVisibility.hasMultiByteTags && <th>Порядок байтов</th>}
                                <th>Ед. изм.</th>
                                {canEdit && <th>Действия</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {editingRow?.id === 'new' && (
                                <TagsTableRow
                                    isNew={true}
                                    isEditing={true}
                                    editingData={editingRow.data}
                                    hasStringTags={columnVisibility.hasStringTags}
                                    hasBitsTags={columnVisibility.hasBitsTags}
                                    hasMultiByteTags={columnVisibility.hasMultiByteTags}
                                    canEdit={canEdit}
                                    onFieldChange={updateEditingField}
                                    onSave={handleSave}
                                    onCancel={cancelEditing}
                                    onByteOrderClick={handleOpenByteOrderModal}
                                    isSaving={isCreating}
                                />
                            )}
                            {tags.map((tag) => {
                                const isEditing = editingRow?.id === tag._id;

                                return (
                                    <TagsTableRow
                                        key={tag._id}
                                        tag={tag}
                                        isEditing={isEditing}
                                        editingData={isEditing ? editingRow.data : undefined}
                                        hasStringTags={columnVisibility.hasStringTags}
                                        hasBitsTags={columnVisibility.hasBitsTags}
                                        hasMultiByteTags={columnVisibility.hasMultiByteTags}
                                        canEdit={canEdit}
                                        onFieldChange={updateEditingField}
                                        onByteOrderClick={isEditing ? handleOpenByteOrderModal : undefined}
                                        onEdit={() => startEditing(tag)}
                                        onDelete={() => handleDeleteClick(tag._id)}
                                        onSave={handleSave}
                                        onCancel={cancelEditing}
                                        onDetails={() => handleOpenDetails(tag)}
                                        isSaving={isUpdatingTag}
                                        isDeleting={isDeleting}
                                        disabled={editingRow !== null && editingRow.id !== tag._id}
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
            <ConfirmModal
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Удаление тэга"
                message="Вы уверены, что хотите удалить этот тэг?"
                confirmText="Удалить"
                cancelText="Отмена"
                confirmVariant="contained"
                isLoading={isDeleting}
            />
        </>
    );
};
