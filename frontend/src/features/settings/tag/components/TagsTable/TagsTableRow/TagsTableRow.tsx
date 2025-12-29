import { memo, useMemo, useCallback, useRef } from 'react';
import { TagsTableActions } from '@/features/settings/tag/components/TagsTable/TagsTableActions/TagsTableActions';
import {
    TagNameCell,
    TagAddressCell,
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
    onSave: () => void;
    onCancel: () => void;
    onDetails?: () => void;
    onClone?: () => void;
    isSaving?: boolean;
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
    onSave,
    onCancel,
    onDetails,
    onClone,
    isSaving = false,
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

    const clickTimeoutRef = useRef<number | null>(null);

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

            // Добавляем задержку, чтобы двойной клик не вызывал выделение
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }

            clickTimeoutRef.current = setTimeout(() => {
                onSelect(!isSelected);
                clickTimeoutRef.current = null;
            }, 200);
        }
    }, [canEdit, onSelect, tag, isEditing, disabled, isSelected]);

    const handleRowDoubleClick = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
        if (canEdit && onEdit && tag && !isEditing && !disabled) {
            // Не редактируем, если клик был по кнопке или другому интерактивному элементу
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
                return;
            }

            // Отменяем выделение при двойном клике
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }

            onEdit();
        }
    }, [canEdit, onEdit, tag, isEditing, disabled]);

    return (
        <tr
            className={`${isEditing ? styles['tagsTableRow_editing'] : ''} ${isSelected && canEdit && !isEditing ? styles['tagsTableRow_selected'] : ''}`}
            onClick={handleRowClick}
            onDoubleClick={handleRowDoubleClick}
        >
            <td>
                <TagNameCell
                    value={displayData.name ?? ''}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('name', value)}
                />
            </td>
            <td>
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
            {canEdit && (
                <td>
                    <TagsTableActions
                        isEditing={isEditing}
                        onSave={onSave}
                        onCancel={onCancel}
                        onDetails={onDetails}
                        onClone={onClone}
                        isSaving={isSaving}
                        isCloning={isCloning}
                        disabled={disabled}
                    />
                </td>
            )}
        </tr>
    );
});
