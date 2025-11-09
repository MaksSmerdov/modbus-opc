import { MenuItem, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Input } from '@/shared/ui/Input/Input';
import { Select } from '@/shared/ui/Select/Select';
import type { Tag, CreateTagData } from '../../../types'
import { shouldShowLength, shouldShowBitIndex } from '../utils/tagsTableUtils';
import styles from './TagsTableCell.module.scss';

interface TagsTableCellProps {
    tag: Tag;
    field: keyof Tag;
    editingData?: Partial<CreateTagData>;
    isEditing: boolean;
    onFieldChange: (field: keyof CreateTagData, value: unknown) => void;
    onByteOrderClick?: () => void;
}

export const TagsTableCell = ({
    tag,
    field,
    editingData,
    isEditing,
    onFieldChange,
    onByteOrderClick,
}: TagsTableCellProps) => {
    if (isEditing && editingData) {
        const value = editingData[field as keyof CreateTagData];
        const currentDataType = editingData.dataType ?? tag.dataType;

        switch (field) {
            case 'name':
                return (
                    <div className={styles['tagsTableCell__inputWrapper']}>
                        <Input
                            type="text"
                            value={value ?? ''}
                            onChange={(e) => onFieldChange('name', e.target.value)}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__input']}
                        />
                    </div>
                );
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
                const addressValue = value === null || value === undefined ? 0 : Number(value);
                const hexAddress = addressValue.toString(16).toUpperCase().padStart(4, '0');
                return (
                    <div className={styles['tagsTableCell__addressWrapper']}>
                        <Input
                            type="number"
                            value={addressValue}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                if (inputValue === '') {
                                    onFieldChange('address', 0);
                                } else {
                                    const parsedValue = parseInt(inputValue, 10);
                                    if (!isNaN(parsedValue) && parsedValue >= 0) {
                                        onFieldChange('address', parsedValue);
                                    }
                                }
                            }}
                            fullWidth={true}
                            helperText=""
                            className={styles['tagsTableCell__addressInput']}
                            placeholder="0"
                        />
                        <span className={styles['tagsTableCell__addressHex']}>
                            (0x{hexAddress})
                        </span>
                    </div>
                );
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
                return (
                    <div className={styles['tagsTableCell__byteOrderWrapper']}>
                        <span className={styles['tagsTableCell__byteOrderValue']}>
                            {String(value ?? 'ABCD')}
                        </span>
                        {onByteOrderClick && (
                            <button
                                type="button"
                                className={styles['tagsTableCell__byteOrderButton']}
                                onClick={onByteOrderClick}
                                title="Изменить порядок байтов"
                            >
                                <Edit fontSize="small" />
                            </button>
                        )}
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

    // Для byteOrder в режиме просмотра всегда показываем значение
    if (field === 'byteOrder') {
        const byteOrderValue = tag.byteOrder ?? 'ABCD';
        return <span>{byteOrderValue}</span>;
    }

    // Для адреса показываем в формате число (0x0000)
    if (field === 'address') {
        const address = tag.address;
        if (address === null || address === undefined) {
            return <span className={styles['tagsTableCell__empty']}>—</span>;
        }
        const hexValue = address.toString(16).toUpperCase().padStart(4, '0');
        return <span>{address} (0x{hexValue})</span>;
    }

    // Для названия показываем с обрезкой и тултипом
    if (field === 'name') {
        const name = tag.name;
        if (!name) {
            return <span className={styles['tagsTableCell__empty']}>—</span>;
        }
        return (
            <Tooltip title={name} arrow>
                <span className={styles['tagsTableCell__name']} >
                    {name}
                </span>
            </Tooltip>

        );
    }

    const displayValue = tag[field];
    if (displayValue === null || displayValue === undefined || displayValue === '') {
        return <span className={styles['tagsTableCell__empty']}>—</span>;
    }
    return <span>{String(displayValue)}</span>;
};