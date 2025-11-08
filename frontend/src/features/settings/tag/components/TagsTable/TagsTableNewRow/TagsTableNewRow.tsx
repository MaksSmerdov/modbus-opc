import { TagsTableActions } from '../TagsTableActions';
import { shouldShowLength, shouldShowBitIndex, shouldShowByteOrder } from '../utils/tagsTableUtils';
import type { CreateTagData } from '../../../types';
import styles from './TagsTableNewRow.module.scss';

interface TagsTableNewRowProps {
    editingData: Partial<CreateTagData>;
    hasStringTags: boolean;
    hasBitsTags: boolean;
    hasMultiByteTags: boolean;
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const TagsTableNewRow = ({
    editingData,
    hasStringTags,
    hasBitsTags,
    hasMultiByteTags,
    onFieldChange,
    onSave,
    onCancel,
    isLoading = false,
}: TagsTableNewRowProps) => {
    const dataType = editingData.dataType ?? 'int16';

    return (
        <tr className={styles['tagsTableNewRow']}>
            <td>
                <input
                    type="text"
                    value={editingData.name ?? ''}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                    className={styles['tagsTableNewRow__input']}
                    placeholder="Название"
                />
            </td>
            <td>
                <input
                    type="number"
                    value={editingData.address ?? 0}
                    onChange={(e) => onFieldChange('address', Number(e.target.value))}
                    className={styles['tagsTableNewRow__input']}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={editingData.category ?? ''}
                    onChange={(e) => onFieldChange('category', e.target.value)}
                    className={styles['tagsTableNewRow__input']}
                />
            </td>
            <td>
                <select
                    value={editingData.functionCode ?? 'holding'}
                    onChange={(e) => onFieldChange('functionCode', e.target.value)}
                    className={styles['tagsTableNewRow__select']}
                >
                    <option value="holding">holding</option>
                    <option value="input">input</option>
                    <option value="coil">coil</option>
                    <option value="discrete">discrete</option>
                </select>
            </td>
            <td>
                <select
                    value={dataType}
                    onChange={(e) => onFieldChange('dataType', e.target.value)}
                    className={styles['tagsTableNewRow__select']}
                >
                    <option value="int16">int16</option>
                    <option value="uint16">uint16</option>
                    <option value="int32">int32</option>
                    <option value="uint32">uint32</option>
                    <option value="float32">float32</option>
                    <option value="string">string</option>
                    <option value="bits">bits</option>
                </select>
            </td>
            {hasStringTags && (
                <td>
                    {shouldShowLength(dataType) ? (
                        <input
                            type="number"
                            value={editingData.length ?? ''}
                            onChange={(e) => onFieldChange('length', e.target.value === '' ? undefined : Number(e.target.value))}
                            className={styles['tagsTableNewRow__input']}
                            placeholder="Обязательно"
                        />
                    ) : (
                        <span className={styles['tagsTableNewRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasBitsTags && (
                <td>
                    {shouldShowBitIndex(dataType) ? (
                        <input
                            type="number"
                            min="0"
                            max="15"
                            value={editingData.bitIndex ?? ''}
                            onChange={(e) => onFieldChange('bitIndex', e.target.value === '' ? null : Number(e.target.value))}
                            className={styles['tagsTableNewRow__input']}
                            placeholder="0-15"
                        />
                    ) : (
                        <span className={styles['tagsTableNewRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasMultiByteTags && (
                <td>
                    {shouldShowByteOrder(dataType) ? (
                        <select
                            value={editingData.byteOrder ?? 'BE'}
                            onChange={(e) => onFieldChange('byteOrder', e.target.value)}
                            className={styles['tagsTableNewRow__select']}
                        >
                            <option value="BE">BE</option>
                            <option value="LE">LE</option>
                            <option value="ABCD">ABCD</option>
                            <option value="CDAB">CDAB</option>
                            <option value="BADC">BADC</option>
                            <option value="DCBA">DCBA</option>
                        </select>
                    ) : (
                        <span className={styles['tagsTableNewRow__empty']}>—</span>
                    )}
                </td>
            )}
            <td>
                <input
                    type="number"
                    step="0.01"
                    value={editingData.scale ?? 1}
                    onChange={(e) => onFieldChange('scale', Number(e.target.value))}
                    className={styles['tagsTableNewRow__input']}
                />
            </td>
            <td>
                <input
                    type="number"
                    step="0.01"
                    value={editingData.offset ?? 0}
                    onChange={(e) => onFieldChange('offset', Number(e.target.value))}
                    className={styles['tagsTableNewRow__input']}
                />
            </td>
            <td>
                <input
                    type="number"
                    value={editingData.decimals ?? 2}
                    onChange={(e) => onFieldChange('decimals', Number(e.target.value))}
                    className={styles['tagsTableNewRow__input']}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={editingData.unit ?? ''}
                    onChange={(e) => onFieldChange('unit', e.target.value)}
                    className={styles['tagsTableNewRow__input']}
                />
            </td>
            <td>
                <TagsTableActions
                    isEditing={true}
                    onSave={onSave}
                    onCancel={onCancel}
                    isSaving={isLoading}
                />
            </td>
        </tr>
    );
};

