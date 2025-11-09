import { MenuItem } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Input } from '@/shared/ui/Input/Input';
import { Select } from '@/shared/ui/Select/Select';
import { TagsTableActions } from '../TagsTableActions';
import { shouldShowLength, shouldShowBitIndex } from '../utils/tagsTableUtils';
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
    onByteOrderClick?: () => void;
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
    onByteOrderClick,
    isLoading = false,
}: TagsTableNewRowProps) => {
    const dataType = editingData.dataType ?? 'int16';

    return (
        <tr className={styles['tagsTableNewRow']}>
            <td>
                <div className={styles['tagsTableNewRow__inputWrapper']}>
                    <Input
                        type="text"
                        value={editingData.name ?? ''}
                        onChange={(e) => onFieldChange('name', e.target.value)}
                        placeholder="Название"
                        fullWidth={true}
                        helperText=""
                        className={styles['tagsTableNewRow__input']}
                    />
                </div>
            </td>
            <td>
                <div className={styles['tagsTableNewRow__addressWrapper']}>
                    <Input
                        type="number"
                        value={editingData.address ?? 0}
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
                        className={styles['tagsTableNewRow__addressInput']}
                        placeholder="0"
                    />
                    <span className={styles['tagsTableNewRow__addressHex']}>
                        (0x{((editingData.address ?? 0).toString(16).toUpperCase().padStart(4, '0'))})
                    </span>
                </div>
            </td>
            <td>
                <div className={styles['tagsTableNewRow__inputWrapper']}>
                    <Input
                        type="text"
                        value={editingData.category ?? ''}
                        onChange={(e) => onFieldChange('category', e.target.value)}
                        fullWidth={true}
                        helperText=""
                        className={styles['tagsTableNewRow__input']}
                    />
                </div>
            </td>
            <td>
                <div className={styles['tagsTableNewRow__selectWrapper']}>
                    <Select
                        value={editingData.functionCode ?? 'holding'}
                        onChange={(e) => onFieldChange('functionCode', e.target.value)}
                        fullWidth={true}
                        helperText=""
                        className={styles['tagsTableNewRow__select']}
                    >
                        <MenuItem value="holding">holding</MenuItem>
                        <MenuItem value="input">input</MenuItem>
                        <MenuItem value="coil">coil</MenuItem>
                        <MenuItem value="discrete">discrete</MenuItem>
                    </Select>
                </div>
            </td>
            <td>
                <div className={styles['tagsTableNewRow__selectWrapper']}>
                    <Select
                        value={dataType}
                        onChange={(e) => onFieldChange('dataType', e.target.value)}
                        fullWidth={true}
                        helperText=""
                        className={styles['tagsTableNewRow__select']}
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
            </td>
            {hasStringTags && (
                <td>
                    {shouldShowLength(dataType) ? (
                        <div className={styles['tagsTableNewRow__inputWrapper']}>
                            <Input
                                type="number"
                                value={editingData.length ?? ''}
                                onChange={(e) => onFieldChange('length', e.target.value === '' ? undefined : Number(e.target.value))}
                                placeholder="Обязательно"
                                fullWidth={true}
                                helperText=""
                                className={styles['tagsTableNewRow__input']}
                            />
                        </div>
                    ) : (
                        <span className={styles['tagsTableNewRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasBitsTags && (
                <td>
                    {shouldShowBitIndex(dataType) ? (
                        <div className={styles['tagsTableNewRow__inputWrapper']}>
                            <Input
                                type="number"
                                inputProps={{ min: 0, max: 15 }}
                                value={editingData.bitIndex ?? ''}
                                onChange={(e) => onFieldChange('bitIndex', e.target.value === '' ? null : Number(e.target.value))}
                                placeholder="0-15"
                                fullWidth={true}
                                helperText=""
                                className={styles['tagsTableNewRow__input']}
                            />
                        </div>
                    ) : (
                        <span className={styles['tagsTableNewRow__empty']}>—</span>
                    )}
                </td>
            )}
            {hasMultiByteTags && (
                <td>
                    <div className={styles['tagsTableNewRow__byteOrderWrapper']}>
                        <span className={styles['tagsTableNewRow__byteOrderValue']}>
                            {editingData.byteOrder ?? 'ABCD'}
                        </span>
                        {onByteOrderClick && (
                            <button
                                type="button"
                                className={styles['tagsTableNewRow__byteOrderButton']}
                                onClick={onByteOrderClick}
                                title="Изменить порядок байтов"
                            >
                                <Edit fontSize="small" />
                            </button>
                        )}
                    </div>
                </td>
            )}
            <td>
                <div className={styles['tagsTableNewRow__inputWrapper']}>
                    <Input
                        type="text"
                        value={editingData.unit ?? ''}
                        onChange={(e) => onFieldChange('unit', e.target.value)}
                        fullWidth={true}
                        helperText=""
                        className={styles['tagsTableNewRow__input']}
                    />
                </div>
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

