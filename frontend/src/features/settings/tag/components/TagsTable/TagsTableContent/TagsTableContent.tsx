import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Table } from '@/shared/ui/Table/Table';
import { TagsTableRow } from '../TagsTableRow/TagsTableRow';
import type { Tag, CreateTagData } from '@/features/settings/tag/types';
import type { TableColumn } from '@/shared/ui/Table/Table';
import type { TableRowData, EditingRow } from '../types';
import styles from '../TagsTable.module.scss';

interface TagsTableContentProps {
    tableData: TableRowData[];
    columns: TableColumn[];
    isDragEnabled: boolean;
    sensors: ReturnType<typeof import('@dnd-kit/core').useSensors>;
    handleDragEnd: (event: import('@dnd-kit/core').DragEndEvent) => Promise<void>;
    editingRow: EditingRow | null;
    columnVisibility: {
        hasStringTags: boolean;
        hasBitsTags: boolean;
        hasMultiByteTags: boolean;
    };
    canEdit: boolean;
    selection: {
        selectedTagIds: Set<string>;
        handleTagSelect: (tagId: string, checked: boolean) => void;
    };
    modalHandlers: {
        byteOrder: {
            open: () => void;
        };
        dataType: {
            open: () => void;
        };
        functionCode: {
            open: () => void;
        };
    };
    updateEditingField: (field: keyof CreateTagData, value: unknown) => void;
    handleSave: () => Promise<void>;
    cancelEditing: () => void;
    startEditing: (tag: Tag) => void;
    handleOpenDetails: (tag: Tag) => void;
    handleCloneClick: (tagId: string) => void;
    isCreating: boolean;
    isUpdatingTag: boolean;
    isCloning: boolean;
}

export const TagsTableContent = ({
    tableData,
    columns,
    isDragEnabled,
    sensors,
    handleDragEnd,
    editingRow,
    columnVisibility,
    canEdit,
    selection,
    modalHandlers,
    updateEditingField,
    handleSave,
    cancelEditing,
    startEditing,
    handleOpenDetails,
    handleCloneClick,
    isCreating,
    isUpdatingTag,
    isCloning,
}: TagsTableContentProps) => {
    const renderRow = (rowData: TableRowData) => {
        if (rowData.type === 'new') {
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
                    onByteOrderClick={modalHandlers.byteOrder.open}
                    onDataTypeClick={modalHandlers.dataType.open}
                    onFunctionCodeClick={modalHandlers.functionCode.open}
                    isSaving={isCreating}
                    reorderMode={isDragEnabled}
                />
            );
        }

        const tag = rowData.tag;
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
                onByteOrderClick={isEditing ? modalHandlers.byteOrder.open : undefined}
                onDataTypeClick={isEditing ? modalHandlers.dataType.open : undefined}
                onFunctionCodeClick={isEditing ? modalHandlers.functionCode.open : undefined}
                onEdit={() => startEditing(tag)}
                onSave={handleSave}
                onCancel={cancelEditing}
                onDetails={() => handleOpenDetails(tag)}
                onClone={() => handleCloneClick(tag._id)}
                isSaving={isUpdatingTag}
                isCloning={isCloning}
                disabled={editingRow !== null && editingRow.id !== tag._id}
                reorderMode={isDragEnabled}
            />
        );
    };

    if (isDragEnabled) {
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                            items={tableData.map(item =>
                                item.type === 'tag' ? item.tag._id : 'new'
                            )}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        columns={columns}
                        data={tableData}
                        emptyMessage="Нет тегов"
                        className={styles['tagsTable__table']}
                        stickyHeader
                        renderRow={renderRow}
                    />
                </SortableContext>
            </DndContext>
        );
    }

    return (
        <Table
            columns={columns}
            data={tableData}
            emptyMessage="Нет тегов"
            className={styles['tagsTable__table']}
            stickyHeader
            renderRow={renderRow}
        />
    );
};

