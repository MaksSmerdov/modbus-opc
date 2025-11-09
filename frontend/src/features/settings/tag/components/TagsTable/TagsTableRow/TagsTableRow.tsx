import { memo, useMemo } from 'react';
import { TagsTableCell } from '../TagsTableCell';
import { TagsTableActions } from '../TagsTableActions';
import { shouldShowLength, shouldShowBitIndex, shouldShowByteOrder } from '../utils/tagsTableUtils';
import type { Tag, CreateTagData } from '../../../types';
import styles from './TagsTableRow.module.scss';

interface TagsTableRowProps {
    tag: Tag;
    isEditing: boolean;
    editingData?: Partial<CreateTagData>;
    hasStringTags: boolean;
    hasBitsTags: boolean;
    hasMultiByteTags: boolean;
    canEdit: boolean;
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
    onEdit: () => void;
    onDelete: () => void;
    onSave: () => void;
    onCancel: () => void;
    onDetails: () => void;
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
    onEdit,
    onDelete,
    onSave,
    onCancel,
    onDetails,
    isSaving = false,
    isDeleting = false,
    disabled = false,
}: TagsTableRowProps) => {
    const currentDataType = useMemo(() =>
        isEditing && editingData?.dataType ? editingData.dataType : tag.dataType,
        [isEditing, editingData?.dataType, tag.dataType]
    );

    const showLength = useMemo(() => shouldShowLength(currentDataType), [currentDataType]);
    const showBitIndex = useMemo(() => shouldShowBitIndex(currentDataType), [currentDataType]);
    const showByteOrder = useMemo(() => shouldShowByteOrder(currentDataType), [currentDataType]);

    return (
        <tr className={isEditing ? styles['tagsTableRow_editing'] : ''}>
            <td>
                <TagsTableCell
                    tag={tag}
                    field="name"
                    editingData={editingData}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
                />
            </td>
            <td>
                <TagsTableCell
                    tag={tag}
                    field="address"
                    editingData={editingData}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
                />
            </td>
            <td>
                <TagsTableCell
                    tag={tag}
                    field="category"
                    editingData={editingData}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
                />
            </td>
            <td>
                <TagsTableCell
                    tag={tag}
                    field="functionCode"
                    editingData={editingData}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
                />
            </td>
            <td>
                <TagsTableCell
                    tag={tag}
                    field="dataType"
                    editingData={editingData}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
                />
            </td>
            {hasStringTags && (
                <td>
                    {showLength ? (
                        <TagsTableCell
                            tag={tag}
                            field="length"
                            editingData={editingData}
                            isEditing={isEditing}
                            onFieldChange={onFieldChange}
                        />
                    ) : (
                        <span className={styles['tagsTableRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasBitsTags && (
                <td>
                    {showBitIndex ? (
                        <TagsTableCell
                            tag={tag}
                            field="bitIndex"
                            editingData={editingData}
                            isEditing={isEditing}
                            onFieldChange={onFieldChange}
                        />
                    ) : (
                        <span className={styles['tagsTableRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasMultiByteTags && (
                <td>
                    {showByteOrder ? (
                        <TagsTableCell
                            tag={tag}
                            field="byteOrder"
                            editingData={editingData}
                            isEditing={isEditing}
                            onFieldChange={onFieldChange}
                        />
                    ) : (
                        <span className={styles['tagsTableRow__empty']}>—</span>
                    )}
                </td>
            )}
            <td>
                <TagsTableCell
                    tag={tag}
                    field="unit"
                    editingData={editingData}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
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

