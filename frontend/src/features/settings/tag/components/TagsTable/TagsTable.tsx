import { useState, useCallback, useMemo } from 'react';
import { useUpdateTagMutation } from '@/features/settings/tag/api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { TagDetailsModal } from '@/features/settings/tag/components/TagDetailsModal/TagDetailsModal';
import { ByteOrderModal } from '@/features/settings/tag/components/ByteOrderModal/ByteOrderModal';
import { DataTypeModal } from '@/features/settings/tag/components/DataTypeModal/DataTypeModal';
import { FunctionCodeModal } from '@/features/settings/tag/components/FunctionCodeModal/FunctionCodeModal';
import { CloneTagModal } from '@/features/settings/tag/components/CloneTagModal/CloneTagModal';
import { TagsTableToolbar } from './TagsTableToolbar/TagsTableToolbar';
import { TagsTableRow } from './TagsTableRow/TagsTableRow';
import { Table } from '@/shared/ui/Table/Table';
import { useTagEditing } from './hooks/useTagEditing';
import { useColumnVisibility } from './hooks/useColumnVisibility';
import { createTagsTableColumns } from './utils/createTagsTableColumns';
import { handleDataTypeChange } from './utils/handleDataTypeChange';
import type { Tag, UpdateTagData, ByteOrder, CreateTagData, DataType, FunctionCode } from '@/features/settings/tag/types';
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
        handleClone,
        startEditing,
        startCreating,
        cancelEditing,
        isCreating,
        isUpdating: isUpdatingTag,
        isDeleting,
        isCloning,
    } = useTagEditing(deviceId);

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [byteOrderModalOpen, setByteOrderModalOpen] = useState(false);
    const [dataTypeModalOpen, setDataTypeModalOpen] = useState(false);
    const [functionCodeModalOpen, setFunctionCodeModalOpen] = useState(false);
    const [cloneModalOpen, setCloneModalOpen] = useState(false);
    const [tagToClone, setTagToClone] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<string | null>(null);
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

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

    const handleOpenDataTypeModal = useCallback(() => {
        setDataTypeModalOpen(true);
    }, []);

    const handleCloseDataTypeModal = useCallback(() => {
        setDataTypeModalOpen(false);
    }, []);

    const handleOpenFunctionCodeModal = useCallback(() => {
        setFunctionCodeModalOpen(true);
    }, []);

    const handleCloseFunctionCodeModal = useCallback(() => {
        setFunctionCodeModalOpen(false);
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

    const handleCloneClick = useCallback((tagId: string) => {
        setTagToClone(tagId);
        setCloneModalOpen(true);
    }, []);

    const handleConfirmClone = useCallback(async (count: number) => {
        if (!tagToClone) return;
        await handleClone(tagToClone, count);
        setCloneModalOpen(false);
        setTagToClone(null);
    }, [tagToClone, handleClone]);

    const handleCancelClone = useCallback(() => {
        setCloneModalOpen(false);
        setTagToClone(null);
    }, []);

    const handleTagSelect = useCallback((tagId: string, checked: boolean) => {
        setSelectedTagIds((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(tagId);
            } else {
                newSet.delete(tagId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            const allTagIds = tags.map((tag) => tag._id);
            setSelectedTagIds(new Set(allTagIds));
        } else {
            setSelectedTagIds(new Set());
        }
    }, [tags]);

    const handleBulkDeleteClick = useCallback(() => {
        if (selectedTagIds.size > 0) {
            setBulkDeleteConfirmOpen(true);
        }
    }, [selectedTagIds.size]);

    const handleBulkDeleteConfirm = useCallback(async () => {
        const tagIdsArray = Array.from(selectedTagIds);
        try {
            for (const tagId of tagIdsArray) {
                await handleDelete(tagId, true); // silent = true, чтобы не показывать уведомления для каждого тега
            }
            setSelectedTagIds(new Set());
            setBulkDeleteConfirmOpen(false);
            showSuccess(`Успешно удалено ${tagIdsArray.length} ${tagIdsArray.length === 1 ? 'тег' : tagIdsArray.length < 5 ? 'тега' : 'тегов'}`);
        } catch (error) {
            console.error('Ошибка массового удаления тегов:', error);
            showError('Не удалось удалить некоторые теги');
        }
    }, [selectedTagIds, handleDelete, showSuccess, showError]);

    const handleBulkDeleteCancel = useCallback(() => {
        setBulkDeleteConfirmOpen(false);
    }, []);

    const isAllSelected = useMemo(() => {
        return tags.length > 0 && selectedTagIds.size === tags.length;
    }, [tags.length, selectedTagIds.size]);

    const isIndeterminate = useMemo(() => {
        return selectedTagIds.size > 0 && selectedTagIds.size < tags.length;
    }, [selectedTagIds.size, tags.length]);

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

    const handleSaveDataType = useCallback((dataType: DataType) => {
        if (!editingRow) return;
        updateEditingField('dataType', dataType);
        setDataTypeModalOpen(false);
    }, [editingRow, updateEditingField]);

    const handleSaveFunctionCode = useCallback((functionCode: FunctionCode) => {
        if (!editingRow) return;
        updateEditingField('functionCode', functionCode);
        setFunctionCodeModalOpen(false);
    }, [editingRow, updateEditingField]);

    return (
        <>
            <div className={styles['tagsTable']}>
                {canEdit && (
                    <TagsTableToolbar
                        onAdd={startCreating}
                        onBulkDelete={handleBulkDeleteClick}
                        onSelectAll={handleSelectAll}
                        selectedCount={selectedTagIds.size}
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
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
                                    onDataTypeClick={handleOpenDataTypeModal}
                                    onFunctionCodeClick={handleOpenFunctionCodeModal}
                                    isSaving={isCreating}
                                />
                            );
                        }

                        const tag = rowData as Tag;
                        const isEditing = editingRow?.id === tag._id;
                        const isSelected = selectedTagIds.has(tag._id);

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
                                isSelected={isSelected}
                                onSelect={(checked) => handleTagSelect(tag._id, checked)}
                                onFieldChange={updateEditingField}
                                onByteOrderClick={isEditing ? handleOpenByteOrderModal : undefined}
                                onDataTypeClick={isEditing ? handleOpenDataTypeModal : undefined}
                                onFunctionCodeClick={isEditing ? handleOpenFunctionCodeModal : undefined}
                                onEdit={() => startEditing(tag)}
                                onSave={handleSave}
                                onCancel={cancelEditing}
                                onDetails={() => handleOpenDetails(tag)}
                                onClone={() => handleCloneClick(tag._id)}
                                isSaving={isUpdatingTag}
                                isCloning={isCloning}
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
                <>
                    <ByteOrderModal
                        open={byteOrderModalOpen}
                        onClose={handleCloseByteOrderModal}
                        currentValue={editingRow.data.byteOrder ?? 'ABCD'}
                        onSave={handleSaveByteOrder}
                    />
                    <DataTypeModal
                        open={dataTypeModalOpen}
                        onClose={handleCloseDataTypeModal}
                        currentValue={editingRow.data.dataType ?? 'int16'}
                        onSave={handleSaveDataType}
                    />
                    <FunctionCodeModal
                        open={functionCodeModalOpen}
                        onClose={handleCloseFunctionCodeModal}
                        currentValue={editingRow.data.functionCode ?? 'holding'}
                        onSave={handleSaveFunctionCode}
                    />
                </>
            )}
            <CloneTagModal
                open={cloneModalOpen}
                onClose={handleCancelClone}
                onConfirm={handleConfirmClone}
                isLoading={isCloning}
            />
            <ConfirmModal
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Удаление тэга"
                message="Вы уверены, что хотите удалить этот тэг?"
                isLoading={isDeleting}
            />
            <ConfirmModal
                open={bulkDeleteConfirmOpen}
                onClose={handleBulkDeleteCancel}
                onConfirm={handleBulkDeleteConfirm}
                title="Массовое удаление тегов"
                message={`Вы уверены, что хотите удалить ${selectedTagIds.size} ${selectedTagIds.size === 1 ? 'тег' : selectedTagIds.size < 5 ? 'тега' : 'тегов'}?`}
                isLoading={isDeleting}
            />
        </>
    );
};
