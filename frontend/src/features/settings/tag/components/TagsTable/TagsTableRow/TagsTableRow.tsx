import { memo, useMemo, useCallback } from 'react';
import { TagsTableActions } from '@/features/settings/tag/components/TagsTable/TagsTableActions/TagsTableActions';
import {
    TagNameCell,
    TagAddressCell,
    TagTextCell,
    TagFunctionCodeCell,
    TagDataTypeCell,
    TagLengthCell,
    TagBitIndexCell,
    TagByteOrderCell,
} from '@/features/settings/tag/components/TagsTable/cells';
import { shouldShowLength, shouldShowBitIndex } from '@/features/settings/tag/components/TagsTable/utils/tagsTableUtils';
import type { Tag, CreateTagData } from '@/features/settings/tag/types';
import styles from './TagsTableRow.module.scss';

interface TagsTableRowProps {
    tag?: Tag;
    isNew?: boolean;
    isEditing: boolean;
    editingData?: Partial<CreateTagData>;
    hasStringTags: boolean;
    hasBitsTags: boolean;
    hasMultiByteTags: boolean;
    canEdit: boolean;
    isSelected?: boolean;
    onSelect?: (checked: boolean) => void;
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
    onByteOrderClick?: () => void;
    onDataTypeClick?: () => void;
    onFunctionCodeClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onClone?: () => void;
    onSave: () => void;
    onCancel: () => void;
    onDetails?: () => void;
    isSaving?: boolean;
    isDeleting?: boolean;
    isCloning?: boolean;
    disabled?: boolean;
}

export const TagsTableRow = memo(({
    tag,
    isEditing,
    editingData,
    hasStringTags,
    hasBitsTags,
    hasMultiByteTags,
    canEdit,
    isSelected = false,
    onSelect,
    onFieldChange,
    onByteOrderClick,
    onDataTypeClick,
    onFunctionCodeClick,
    onEdit,
    onDelete,
    onClone,
    onSave,
    onCancel,
    onDetails,
    isSaving = false,
    isDeleting = false,
    isCloning = false,
    disabled = false,
}: TagsTableRowProps) => {
    const currentDataType = useMemo(() => {
        if (isEditing && editingData?.dataType) {
            return editingData.dataType;
        }
        return tag?.dataType ?? 'int16';
    }, [isEditing, editingData?.dataType, tag?.dataType]);

    const showLength = useMemo(() => shouldShowLength(currentDataType), [currentDataType]);
    const showBitIndex = useMemo(() => shouldShowBitIndex(currentDataType), [currentDataType]);

    // Определяем значения для отображения
    const displayData = isEditing && editingData 
        ? editingData 
        : (tag ? {
            name: tag.name,
            address: tag.address,
            functionCode: tag.functionCode,
            dataType: tag.dataType,
            length: tag.length,
            bitIndex: tag.bitIndex,
            byteOrder: tag.byteOrder,
            scale: tag.scale,
            offset: tag.offset,
            decimals: tag.decimals,
            unit: tag.unit,
        } : {});

    const handleRowClick = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
        if (canEdit && onSelect && tag && !isEditing && !disabled) {
            // Не выделяем, если клик был по кнопке, ссылке, меню или другому интерактивному элементу
            const target = e.target as HTMLElement;
            if (
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('select') ||
                target.closest('[role="menu"]') ||
                target.closest('[role="menuitem"]') ||
                target.closest('.MuiMenu-root') ||
                target.closest('.MuiMenuItem-root')
            ) {
                return;
            }
            onSelect(!isSelected);
        }
    }, [canEdit, onSelect, tag, isEditing, disabled, isSelected]);

    const handleNameDoubleClick = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
        e.stopPropagation();
        if (canEdit && onEdit && tag && !isEditing && !disabled) {
            onEdit();
        }
    }, [canEdit, onEdit, tag, isEditing, disabled]);

    const handleAddressDoubleClick = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
        e.stopPropagation();
        if (canEdit && onEdit && tag && !isEditing && !disabled) {
            onEdit();
        }
    }, [canEdit, onEdit, tag, isEditing, disabled]);

    return (
        <tr 
            className={`${isEditing ? styles['tagsTableRow_editing'] : ''} ${isSelected && canEdit && !isEditing ? styles['tagsTableRow_selected'] : ''}`}
            onClick={handleRowClick}
        >
            <td 
                onDoubleClick={handleNameDoubleClick}
                className={canEdit && !isEditing && tag ? styles['tagsTableRow__editableCell'] : ''}
                title={canEdit && !isEditing && tag ? 'Двойной клик для редактирования' : undefined}
            >
                <TagNameCell
                    value={displayData.name ?? ''}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('name', value)}
                />
            </td>
            <td 
                onDoubleClick={handleAddressDoubleClick}
                className={canEdit && !isEditing && tag ? styles['tagsTableRow__editableCell'] : ''}
                title={canEdit && !isEditing && tag ? 'Двойной клик для редактирования' : undefined}
            >
                <TagAddressCell
                    value={displayData.address ?? 0}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('address', value)}
                />
            </td>
            <td>
                <TagFunctionCodeCell
                    value={displayData.functionCode}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('functionCode', value)}
                    onFunctionCodeClick={onFunctionCodeClick}
                />
            </td>
            <td>
                <TagDataTypeCell
                    value={displayData.dataType}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('dataType', value)}
                    onDataTypeClick={onDataTypeClick}
                />
            </td>
            {hasStringTags && (
                <td>
                    {showLength ? (
                        <TagLengthCell
                            value={displayData.length}
                            dataType={currentDataType}
                            isEditing={isEditing}
                            onChange={(value) => onFieldChange('length', value)}
                        />
                    ) : (
                        <span className={styles['tagsTableRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasBitsTags && (
                <td>
                    {showBitIndex ? (
                        <TagBitIndexCell
                            value={displayData.bitIndex ?? null}
                            dataType={currentDataType}
                            isEditing={isEditing}
                            onChange={(value) => onFieldChange('bitIndex', value)}
                        />
                    ) : (
                        <span className={styles['tagsTableRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasMultiByteTags && (
                <td>
                    <TagByteOrderCell
                        value={isEditing && editingData 
                            ? (editingData.byteOrder ?? 'ABCD')
                            : displayData.byteOrder}
                        isEditing={isEditing}
                        onChange={(value) => onFieldChange('byteOrder', value)}
                        onByteOrderClick={onByteOrderClick}
                    />
                </td>
            )}
            <td>
                <TagTextCell
                    value={displayData.unit ?? ''}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('unit', value)}
                />
            </td>
            {canEdit && (
                <td>
                    <TagsTableActions
                        isEditing={isEditing}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onClone={onClone}
                        onSave={onSave}
                        onCancel={onCancel}
                        onDetails={onDetails}
                        disabled={disabled}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        isCloning={isCloning}
                    />
                </td>
            )}
        </tr>
    );
});
