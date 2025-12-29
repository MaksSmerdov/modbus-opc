import { useState, useCallback, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useUpdateTagMutation, useReorderTagsMutation } from '@/features/settings/tag/api/tagsApi';
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
import { useModals } from './hooks/useModals';
import { useTagSelection } from './hooks/useTagSelection';
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
    const [reorderTags, { isLoading: isReordering }] = useReorderTagsMutation();

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

    const modals = useModals();

    // Режим перестановки тегов
    const [reorderMode, setReorderMode] = useState(false);

    // Локальное состояние для порядка тегов (оптимистичное обновление)
    const [localTags, setLocalTags] = useState<Tag[]>(tags);

    // Синхронизируем локальное состояние с пропсами
    useEffect(() => {
        setLocalTags(tags);
    }, [tags]);

    const selection = useTagSelection(localTags);

    // Для TagDetailsModal нужен полный объект Tag, а не только ID
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Минимальное расстояние для начала перетаскивания
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Отключаем drag and drop, если не в режиме перестановки
    const isDragEnabled = reorderMode && canEdit && !editingRow && !isCreating;

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

        // Добавляем все теги из локального состояния
        data.push(...localTags);

        return data;
    }, [localTags, editingRow]);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            // Не позволяем перетаскивать новую строку
            if (active.id === 'new' || over.id === 'new') {
                return;
            }

            const activeIndex = localTags.findIndex(tag => tag._id === active.id);
            const overIndex = localTags.findIndex(tag => tag._id === over.id);

            if (activeIndex === -1 || overIndex === -1) {
                return;
            }

            // Оптимистичное обновление
            const newTags = arrayMove(localTags, activeIndex, overIndex);
            setLocalTags(newTags);

            // Обновляем порядок на бэкенде
            const tagIds = newTags.map(tag => tag._id);
            try {
                await reorderTags({ deviceId, tagIds }).unwrap();
                showSuccess('Порядок тегов успешно обновлен');
            } catch (error) {
                console.error('Ошибка обновления порядка тегов:', error);
                showError('Не удалось обновить порядок тегов');
                // Откатываем изменения
                setLocalTags(tags);
            }
        },
        [localTags, tags, deviceId, reorderTags, showSuccess, showError]
    );

    const handleOpenDetails = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        modals.openModal('details', tag);
    }, [modals]);

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
        modals.closeModal('details');
        setSelectedTag(null);
    }, [modals]);

    const handleOpenByteOrderModal = useCallback(() => {
        modals.openModal('byteOrder');
    }, [modals]);

    const handleCloseByteOrderModal = useCallback(() => {
        modals.closeModal('byteOrder');
    }, [modals]);

    const handleOpenDataTypeModal = useCallback(() => {
        modals.openModal('dataType');
    }, [modals]);

    const handleCloseDataTypeModal = useCallback(() => {
        modals.closeModal('dataType');
    }, [modals]);

    const handleOpenFunctionCodeModal = useCallback(() => {
        modals.openModal('functionCode');
    }, [modals]);

    const handleCloseFunctionCodeModal = useCallback(() => {
        modals.closeModal('functionCode');
    }, [modals]);

    const handleConfirmDelete = useCallback(async () => {
        const tagToDelete = modals.getModalDataByType<string>('delete');
        if (!tagToDelete) return;
        await handleDelete(tagToDelete);
        modals.closeModal('delete');
    }, [modals, handleDelete]);

    const handleCancelDelete = useCallback(() => {
        modals.closeModal('delete');
    }, [modals]);

    const handleCloneClick = useCallback((tagId: string) => {
        modals.openModal('clone', tagId);
    }, [modals]);

    const handleConfirmClone = useCallback(async (count: number) => {
        const tagToClone = modals.getModalDataByType<string>('clone');
        if (!tagToClone) return;
        await handleClone(tagToClone, count);
        modals.closeModal('clone');
    }, [modals, handleClone]);

    const handleCancelClone = useCallback(() => {
        modals.closeModal('clone');
    }, [modals]);

    const handleBulkDeleteClick = useCallback(() => {
        if (selection.selectedCount > 0) {
            modals.openModal('bulkDelete');
        }
    }, [modals, selection.selectedCount]);

    const handleBulkDeleteConfirm = useCallback(async () => {
        const tagIdsArray = Array.from(selection.selectedTagIds);
        try {
            for (const tagId of tagIdsArray) {
                await handleDelete(tagId, true); // silent = true, чтобы не показывать уведомления для каждого тега
            }
            selection.clearSelection();
            modals.closeModal('bulkDelete');
            showSuccess(`Успешно удалено ${tagIdsArray.length} ${tagIdsArray.length === 1 ? 'тег' : tagIdsArray.length < 5 ? 'тега' : 'тегов'}`);
        } catch (error) {
            console.error('Ошибка массового удаления тегов:', error);
            showError('Не удалось удалить некоторые теги');
        }
    }, [selection, modals, handleDelete, showSuccess, showError]);

    const handleBulkDeleteCancel = useCallback(() => {
        modals.closeModal('bulkDelete');
    }, [modals]);

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

    // Создаем функцию renderRow с правильной типизацией
    const renderRowInDragMode = useCallback((rowData: TableRowData) => {
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
                    reorderMode={true}
                />
            );
        }

        const tag = rowData as Tag;
        const isEditing = editingRow?.id === tag._id;
        const isSelected = selection.selectedTagIds.has(tag._id);

        return (
            <TagsTableRow
                key={tag._id}
                tag={tag}
                isEditing={isEditing}
                editingData={isEditing ? editingRow?.data : undefined}
                hasStringTags={columnVisibility.hasStringTags}
                hasBitsTags={columnVisibility.hasBitsTags}
                hasMultiByteTags={columnVisibility.hasMultiByteTags}
                canEdit={canEdit}
                isSelected={isSelected}
                onSelect={(checked) => selection.handleTagSelect(tag._id, checked)}
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
                reorderMode={true}
            />
        );
    }, [editingRow, columnVisibility, canEdit, updateEditingField, handleSave, cancelEditing, handleOpenByteOrderModal, handleOpenDataTypeModal, handleOpenFunctionCodeModal, isCreating, selection, startEditing, handleOpenDetails, handleCloneClick, isUpdatingTag, isCloning]);

    const handleSaveByteOrder = useCallback((byteOrder: ByteOrder) => {
        if (!editingRow) return;
        updateEditingField('byteOrder', byteOrder);
        modals.closeModal('byteOrder');
    }, [editingRow, updateEditingField, modals]);

    const handleSaveDataType = useCallback((dataType: DataType) => {
        if (!editingRow) return;
        updateEditingField('dataType', dataType);
        modals.closeModal('dataType');
    }, [editingRow, updateEditingField, modals]);

    const handleSaveFunctionCode = useCallback((functionCode: FunctionCode) => {
        if (!editingRow) return;
        updateEditingField('functionCode', functionCode);
        modals.closeModal('functionCode');
    }, [editingRow, updateEditingField, modals]);

    return (
        <>
            <div className={styles['tagsTable']}>
                {canEdit && (
                    <TagsTableToolbar
                        onAdd={startCreating}
                        onBulkDelete={handleBulkDeleteClick}
                        onSelectAll={selection.handleSelectAll}
                        selectedCount={selection.selectedCount}
                        isAllSelected={selection.isAllSelected}
                        isIndeterminate={selection.isIndeterminate}
                        disabled={editingRow !== null || isCreating || isReordering}
                        reorderMode={reorderMode}
                        onReorderModeChange={setReorderMode}
                    />
                )}
                {isDragEnabled ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tableData.map(item =>
                                '_id' in item ? item._id : 'new'
                            )}
                            strategy={verticalListSortingStrategy}
                        >
                            <Table
                                columns={columns}
                                data={tableData}
                                emptyMessage="Нет тегов"
                                className={styles['tagsTable__table']}
                                stickyHeader
                                renderRow={renderRowInDragMode}
                            />
                        </SortableContext>
                    </DndContext>
                ) : (
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
                                        reorderMode={false}
                                    />
                                );
                            }

                            const tag = rowData as Tag;
                            const isEditing = editingRow?.id === tag._id;
                            const isSelected = selection.selectedTagIds.has(tag._id);

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
                                    onSelect={(checked) => selection.handleTagSelect(tag._id, checked)}
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
                                    reorderMode={false}
                                />
                            );
                        }}
                    />
                )}
            </div>
            <TagDetailsModal
                open={modals.isOpen('details')}
                onClose={handleCloseDetailsModal}
                tag={selectedTag}
                onSave={handleSaveDetails}
                isLoading={isUpdating}
            />
            {editingRow && (
                <>
                    <ByteOrderModal
                        open={modals.isOpen('byteOrder')}
                        onClose={handleCloseByteOrderModal}
                        currentValue={editingRow.data.byteOrder ?? 'ABCD'}
                        onSave={handleSaveByteOrder}
                    />
                    <DataTypeModal
                        open={modals.isOpen('dataType')}
                        onClose={handleCloseDataTypeModal}
                        currentValue={editingRow.data.dataType ?? 'int16'}
                        onSave={handleSaveDataType}
                    />
                    <FunctionCodeModal
                        open={modals.isOpen('functionCode')}
                        onClose={handleCloseFunctionCodeModal}
                        currentValue={editingRow.data.functionCode ?? 'holding'}
                        onSave={handleSaveFunctionCode}
                    />
                </>
            )}
            <CloneTagModal
                open={modals.isOpen('clone')}
                onClose={handleCancelClone}
                onConfirm={handleConfirmClone}
                isLoading={isCloning}
            />
            <ConfirmModal
                open={modals.isOpen('delete')}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Удаление тэга"
                message="Вы уверены, что хотите удалить этот тэг?"
                isLoading={isDeleting}
            />
            <ConfirmModal
                open={modals.isOpen('bulkDelete')}
                onClose={handleBulkDeleteCancel}
                onConfirm={handleBulkDeleteConfirm}
                title="Массовое удаление тегов"
                message={`Вы уверены, что хотите удалить ${selection.selectedCount} ${selection.selectedCount === 1 ? 'тег' : selection.selectedCount < 5 ? 'тега' : 'тегов'}?`}
                isLoading={isDeleting}
            />
        </>
    );
};
