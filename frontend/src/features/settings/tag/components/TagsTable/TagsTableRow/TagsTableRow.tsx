import { memo, useMemo } from 'react';
import { TagsTableActions } from '../TagsTableActions/TagsTableActions';
import {
    TagNameCell,
    TagAddressCell,
    TagTextCell,
    TagFunctionCodeCell,
    TagDataTypeCell,
    TagLengthCell,
    TagBitIndexCell,
    TagByteOrderCell,
} from '../cells';
import { shouldShowLength, shouldShowBitIndex } from '../utils/tagsTableUtils';
import type { Tag, CreateTagData } from '../../../types';
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
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
    onByteOrderClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onSave: () => void;
    onCancel: () => void;
    onDetails?: () => void;
    isSaving?: boolean;
    isDeleting?: boolean;
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
    onFieldChange,
    onByteOrderClick,
    onEdit,
    onDelete,
    onSave,
    onCancel,
    onDetails,
    isSaving = false,
    isDeleting = false,
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
            category: tag.category,
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

    return (
        <tr className={isEditing ? styles['tagsTableRow_editing'] : ''}>
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
                <TagTextCell
                    value={displayData.category ?? ''}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('category', value)}
                />
            </td>
            <td>
                <TagFunctionCodeCell
                    value={displayData.functionCode}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('functionCode', value)}
                />
            </td>
            <td>
                <TagDataTypeCell
                    value={displayData.dataType}
                    isEditing={isEditing}
                    onChange={(value) => onFieldChange('dataType', value)}
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
                        onSave={onSave}
                        onCancel={onCancel}
                        onDetails={onDetails}
                        disabled={disabled}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                    />
                </td>
            )}
        </tr>
    );
});
