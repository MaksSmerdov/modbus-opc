import { useState, useCallback, useMemo } from 'react';
import { useUpdateTagMutation } from '@/features/settings/tag/api/tagsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { TagsTableToolbar } from './TagsTableToolbar/TagsTableToolbar';
import { TagsTableContent } from './TagsTableContent/TagsTableContent';
import { TagsTableModals } from './TagsTableModals/TagsTableModals';
import { useTagEditingReducer } from './hooks/useTagEditingReducer';
import { useLocalTags } from './hooks/useLocalTags';
import { useColumnVisibility } from './hooks/useColumnVisibility';
import { useModals } from './hooks/useModals';
import { useTagSelection } from './hooks/useTagSelection';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useModalHandlers } from './hooks/useModalHandlers';
import { createTagsTableColumns } from './utils/createTagsTableColumns';
import type { Tag, UpdateTagData } from '@/features/settings/tag/types';
import type { TableRowData } from './types';
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
    handleSave,
    handleDelete,
    handleClone,
    startEditing,
    startCreating,
    cancelEditing,
    updateField,
    isCreating,
    isUpdating: isUpdatingTag,
    isDeleting,
    isCloning,
  } = useTagEditingReducer(deviceId);

  const modals = useModals();

  // Режим перестановки тегов
  const [reorderMode, setReorderMode] = useState(false);

  // Используем хук для управления локальным состоянием тегов
  const { localTags, setLocalTags } = useLocalTags(tags);

  const selection = useTagSelection(localTags);

  // Для TagDetailsModal нужен полный объект Tag, а не только ID
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Используем хук для drag-and-drop
  const { isDragEnabled, sensors, handleDragEnd } = useDragAndDrop({
    deviceId,
    tags,
    localTags,
    setLocalTags,
    canEdit,
    editingRow,
    isCreating,
    reorderMode,
  });

  const columnVisibility = useColumnVisibility(tags, editingRow, canEdit);

  const columns = useMemo(() => createTagsTableColumns(columnVisibility, canEdit), [columnVisibility, canEdit]);

  // Объединяем данные: теги + новая строка (если есть)
  const tableData = useMemo<TableRowData[]>(() => {
    const data: TableRowData[] = [];

    // Добавляем новую строку в начало, если она редактируется
    if (editingRow?.id === 'new') {
      data.push({ type: 'new', id: 'new' });
    }

    // Добавляем все теги из локального состояния
    data.push(...localTags.map((tag) => ({ type: 'tag' as const, tag })));

    return data;
  }, [localTags, editingRow]);

  // Используем хук для обработчиков модалок
  const modalHandlers = useModalHandlers({
    modals,
    editingRow,
    onFieldChange: updateField,
  });

  const handleOpenDetails = useCallback(
    (tag: Tag) => {
      setSelectedTag(tag);
      modalHandlers.details.open(tag);
    },
    [modalHandlers]
  );

  const handleSaveDetails = useCallback(
    async (data: UpdateTagData) => {
      if (!selectedTag) return;
      try {
        await updateTag({ deviceId, tagId: selectedTag._id, data }).unwrap();
        showSuccess('Дополнительные параметры успешно обновлены');
      } catch (error) {
        console.error('Ошибка обновления параметров:', error);
        showError('Не удалось обновить параметры');
        throw error;
      }
    },
    [selectedTag, deviceId, updateTag, showSuccess, showError]
  );

  const handleConfirmDelete = useCallback(async () => {
    const tagToDelete = modals.getModalDataByType<string>('delete');
    if (!tagToDelete) return;
    await handleDelete(tagToDelete);
    modalHandlers.delete.close();
  }, [modals, handleDelete, modalHandlers]);

  const handleCloneClick = useCallback(
    (tagId: string) => {
      modalHandlers.clone.open(tagId);
    },
    [modalHandlers]
  );

  const handleConfirmClone = useCallback(
    async (count: number) => {
      const tagToClone = modals.getModalDataByType<string>('clone');
      if (!tagToClone) return;
      await handleClone(tagToClone, count);
      modalHandlers.clone.close();
    },
    [modals, handleClone, modalHandlers]
  );

  const handleBulkDeleteClick = useCallback(() => {
    if (selection.selectedCount > 0) {
      modalHandlers.bulkDelete.open();
    }
  }, [modalHandlers, selection.selectedCount]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    const tagIdsArray = Array.from(selection.selectedTagIds);
    try {
      for (const tagId of tagIdsArray) {
        await handleDelete(tagId, true); // silent = true, чтобы не показывать уведомления для каждого тега
      }
      selection.clearSelection();
      modalHandlers.bulkDelete.close();
      showSuccess(
        `Успешно удалено ${tagIdsArray.length} ${
          tagIdsArray.length === 1 ? 'тег' : tagIdsArray.length < 5 ? 'тега' : 'тегов'
        }`
      );
    } catch (error) {
      console.error('Ошибка массового удаления тегов:', error);
      showError('Не удалось удалить некоторые теги');
    }
  }, [selection, modalHandlers, handleDelete, showSuccess, showError]);

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
            disabled={editingRow !== null || isCreating}
            reorderMode={reorderMode}
            onReorderModeChange={setReorderMode}
          />
        )}
        <TagsTableContent
          tableData={tableData}
          columns={columns}
          isDragEnabled={isDragEnabled}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          editingRow={editingRow}
          columnVisibility={columnVisibility}
          canEdit={canEdit}
          selection={selection}
          modalHandlers={modalHandlers}
          updateEditingField={updateField}
          handleSave={handleSave}
          cancelEditing={cancelEditing}
          startEditing={startEditing}
          handleOpenDetails={handleOpenDetails}
          handleCloneClick={handleCloneClick}
          isCreating={isCreating}
          isUpdatingTag={isUpdatingTag}
          isCloning={isCloning}
          reorderMode={reorderMode}
        />
      </div>
      <TagsTableModals
        modals={modals}
        editingRow={editingRow}
        selectedTag={selectedTag}
        selection={selection}
        modalHandlers={modalHandlers}
        onSaveDetails={handleSaveDetails}
        onConfirmDelete={handleConfirmDelete}
        onConfirmClone={handleConfirmClone}
        onBulkDeleteConfirm={handleBulkDeleteConfirm}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isCloning={isCloning}
      />
    </>
  );
};
