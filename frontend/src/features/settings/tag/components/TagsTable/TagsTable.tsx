import { useState, useCallback, useMemo } from 'react';
import { useUpdateTagMutation } from '@/features/settings/tag/api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { TagDetailsModal } from '@/features/settings/tag/components/TagDetailsModal/TagDetailsModal';
import { ByteOrderModal } from '@/features/settings/tag/components/ByteOrderModal/ByteOrderModal';
import { TagsTableToolbar } from './TagsTableToolbar/TagsTableToolbar';
import { TagsTableRow } from './TagsTableRow/TagsTableRow';
import { Table } from '@/shared/ui/Table/Table';
import { useTagEditing } from './hooks/useTagEditing';
import { useColumnVisibility } from './hooks/useColumnVisibility';
import { createTagsTableColumns } from './utils/createTagsTableColumns';
import { handleDataTypeChange } from './utils/handleDataTypeChange';
import type { Tag, UpdateTagData, ByteOrder, CreateTagData } from '@/features/settings/tag/types';
import styles from './TagsTable.module.scss';

interface TagsTableProps {
    deviceId: string;
    tags: Tag[];
    canEdit?: boolean;
}

// Тип для объединения тега и новой строки
type TableRowData = Tag | { _id: 'new'; isNew: true };

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

    const columns = useMemo(
        () => createTagsTableColumns(columnVisibility, canEdit),
        [columnVisibility, canEdit]
    );


    // Объединяем данные: теги + новая строка (если есть)
    const tableData = useMemo<TableRowData[]>(() => {
        const data: TableRowData[] = [];

        // Добавляем новую строку в начало, если она редактируется
        if (editingRow?.id === 'new') {
            data.push({ _id: 'new', isNew: true } as TableRowData);
        }

        // Добавляем все теги
        data.push(...tags);

        return data;
    }, [tags, editingRow]);

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

    const updateEditingField = useCallback(
        (field: keyof CreateTagData, value: unknown) => {
            if (!editingRow) return;

            if (field === 'dataType') {
                const updatedData = handleDataTypeChange(
                    value as CreateTagData['dataType'],
                    editingRow.data
                );
                setEditingRow({ ...editingRow, data: updatedData });
            } else {
                setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, [field]: value },
                });
            }
        },
        [editingRow, setEditingRow]
    );

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
                <Table
                    columns={columns}
                    data={tableData}
                    emptyMessage="Нет тегов"
                    className={styles['tagsTable__table']}
                    stickyHeader
                    renderRow={(rowData) => {
                        if ('isNew' in rowData && rowData.isNew) {
                            return (
                                <TagsTableRow
                                    key="new"
                                    isNew={true}
                                    isEditing={true}
                                    editingData={editingRow?.data}
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
                            );
                        }

                        const tag = rowData as Tag;
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
                    }}
                />
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
                isLoading={isDeleting}
            />
        </>
    );
};
