import { MenuItem } from '@mui/material';
import { Input } from '@/shared/ui/Input/Input';
import { Select } from '@/shared/ui/Select/Select';
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
                    <div className={styles['tagsTableCell__inputWrapper']}>
                        <Input
                            type="text"
                            value={value ?? ''}
                            onChange={(e) => onFieldChange(field as keyof CreateTagData, e.target.value)}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__input']}
                        />
                    </div>
                );
            case 'address':
            case 'scale':
            case 'offset':
            case 'decimals':
                const numValue = value === null || value === undefined ? '' : value;
                return (
                    <div className={styles['tagsTableCell__inputWrapper']}>
                        <Input
                            type="number"
                            value={numValue}
                            onChange={(e) => onFieldChange(
                                field as keyof CreateTagData,
                                e.target.value === '' ? undefined : Number(e.target.value)
                            )}
                            inputProps={field === 'scale' || field === 'offset' ? { step: 0.01 } : { step: 1 }}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__input']}
                        />
                    </div>
                );
            case 'length':
                if (!shouldShowLength(currentDataType)) {
                    return <span className={styles['tagsTableCell__empty']}>—</span>;
                }
                return (
                    <div className={styles['tagsTableCell__inputWrapper']}>
                        <Input
                            type="number"
                            value={value ?? ''}
                            onChange={(e) => onFieldChange(
                                'length',
                                e.target.value === '' ? undefined : Number(e.target.value)
                            )}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__input']}
                        />
                    </div>
                );
            case 'bitIndex':
                if (!shouldShowBitIndex(currentDataType)) {
                    return <span className={styles['tagsTableCell__empty']}>—</span>;
                }
                return (
                    <div className={styles['tagsTableCell__inputWrapper']}>
                        <Input
                            type="number"
                            inputProps={{ min: 0, max: 15 }}
                            value={value ?? ''}
                            onChange={(e) => onFieldChange(
                                'bitIndex',
                                e.target.value === '' ? null : Number(e.target.value)
                            )}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__input']}
                        />
                    </div>
                );
            case 'byteOrder':
                if (!shouldShowByteOrder(currentDataType)) {
                    return <span className={styles['tagsTableCell__empty']}>—</span>;
                }
                return (
                    <div className={styles['tagsTableCell__selectWrapper']}>
                        <Select
                            value={value ?? 'BE'}
                            onChange={(e) => onFieldChange('byteOrder', e.target.value)}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__select']}
                        >
                            <MenuItem value="BE">BE</MenuItem>
                            <MenuItem value="LE">LE</MenuItem>
                            <MenuItem value="ABCD">ABCD</MenuItem>
                            <MenuItem value="CDAB">CDAB</MenuItem>
                            <MenuItem value="BADC">BADC</MenuItem>
                            <MenuItem value="DCBA">DCBA</MenuItem>
                        </Select>
                    </div>
                );
            case 'functionCode':
                return (
                    <div className={styles['tagsTableCell__selectWrapper']}>
                        <Select
                            value={value ?? 'holding'}
                            onChange={(e) => onFieldChange('functionCode', e.target.value)}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__select']}
                        >
                            <MenuItem value="holding">holding</MenuItem>
                            <MenuItem value="input">input</MenuItem>
                            <MenuItem value="coil">coil</MenuItem>
                            <MenuItem value="discrete">discrete</MenuItem>
                        </Select>
                    </div>
                );
            case 'dataType':
                return (
                    <div className={styles['tagsTableCell__selectWrapper']}>
                        <Select
                            value={value ?? 'int16'}
                            onChange={(e) => onFieldChange('dataType', e.target.value)}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__select']}
                        >
                            <MenuItem value="int16">int16</MenuItem>
                            <MenuItem value="uint16">uint16</MenuItem>
                            <MenuItem value="int32">int32</MenuItem>
                            <MenuItem value="uint32">uint32</MenuItem>
                            <MenuItem value="float32">float32</MenuItem>
                            <MenuItem value="string">string</MenuItem>
                            <MenuItem value="bits">bits</MenuItem>
                        </Select>
                    </div>
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