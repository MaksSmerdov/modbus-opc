import type { Tag, CreateTagData } from '../../../types'
import { shouldShowLength, shouldShowBitIndex, shouldShowByteOrder } from '../utils/tagsTableUtils';
import styles from './TagsTableCell.module.scss';

interface TagsTableCellProps {
    tag: Tag;
    field: keyof Tag;
    editingData?: Partial<CreateTagData>;
    isEditing: boolean;
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
}

export const TagsTableCell = ({
    tag,
    field,
    editingData,
    isEditing,
    onFieldChange,
}: TagsTableCellProps) => {
    if (isEditing && editingData) {
        const value = editingData[field as keyof CreateTagData];
        const currentDataType = editingData.dataType ?? tag.dataType;

        switch (field) {
            case 'name':
            case 'category':
            case 'unit':
                return (
                    <input
                        type="text"
                        value={value ?? ''}
                        onChange={(e) => onFieldChange(field as keyof CreateTagData, e.target.value)}
                        className={styles['tagsTableCell__input']}
                    />
                );
            case 'address':
            case 'scale':
            case 'offset':
            case 'decimals':
                const numValue = value === null || value === undefined ? '' : value;
                return (
                    <input
                        type="number"
                        value={numValue}
                        onChange={(e) => onFieldChange(
                            field as keyof CreateTagData,
                            e.target.value === '' ? undefined : Number(e.target.value)
                        )}
                        className={styles['tagsTableCell__input']}
                        step={field === 'scale' || field === 'offset' ? '0.01' : '1'}
                    />
                );
            case 'length':
                if (!shouldShowLength(currentDataType)) {
                    return <span className={styles['tagsTableCell__empty']}>—</span>;
                }
                return (
                    <input
                        type="number"
                        value={value ?? ''}
                        onChange={(e) => onFieldChange(
                            'length',
                            e.target.value === '' ? undefined : Number(e.target.value)
                        )}
                        className={styles['tagsTableCell__input']}
                    />
                );
            case 'bitIndex':
                if (!shouldShowBitIndex(currentDataType)) {
                    return <span className={styles['tagsTableCell__empty']}>—</span>;
                }
                return (
                    <input
                        type="number"
                        min="0"
                        max="15"
                        value={value ?? ''}
                        onChange={(e) => onFieldChange(
                            'bitIndex',
                            e.target.value === '' ? null : Number(e.target.value)
                        )}
                        className={styles['tagsTableCell__input']}
                    />
                );
            case 'byteOrder':
                if (!shouldShowByteOrder(currentDataType)) {
                    return <span className={styles['tagsTableCell__empty']}>—</span>;
                }
                return (
                    <select
                        value={value ?? 'BE'}
                        onChange={(e) => onFieldChange('byteOrder', e.target.value)}
                        className={styles['tagsTableCell__select']}
                    >
                        <option value="BE">BE</option>
                        <option value="LE">LE</option>
                        <option value="ABCD">ABCD</option>
                        <option value="CDAB">CDAB</option>
                        <option value="BADC">BADC</option>
                        <option value="DCBA">DCBA</option>
                    </select>
                );
            case 'functionCode':
                return (
                    <select
                        value={value ?? 'holding'}
                        onChange={(e) => onFieldChange('functionCode', e.target.value)}
                        className={styles['tagsTableCell__select']}
                    >
                        <option value="holding">holding</option>
                        <option value="input">input</option>
                        <option value="coil">coil</option>
                        <option value="discrete">discrete</option>
                    </select>
                );
            case 'dataType':
                return (
                    <select
                        value={value ?? 'int16'}
                        onChange={(e) => onFieldChange('dataType', e.target.value)}
                        className={styles['tagsTableCell__select']}
                    >
                        <option value="int16">int16</option>
                        <option value="uint16">uint16</option>
                        <option value="int32">int32</option>
                        <option value="uint32">uint32</option>
                        <option value="float32">float32</option>
                        <option value="string">string</option>
                        <option value="bits">bits</option>
                    </select>
                );
            default:
                return <span>{String(tag[field] ?? '')}</span>;
        }
    }

    const displayValue = tag[field];
    if (displayValue === null || displayValue === undefined || displayValue === '') {
        return <span className={styles['tagsTableCell__empty']}>—</span>;
    }
    return <span>{String(displayValue)}</span>;
};