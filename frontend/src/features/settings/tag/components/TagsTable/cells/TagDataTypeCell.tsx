import { MenuItem } from '@mui/material';
import { Select } from '@/shared/ui/Select/Select';
import type { DataType } from '@/features/settings/tag/types';
import styles from './TagCell.module.scss';

interface TagDataTypeCellProps {
    value: DataType | undefined;
    isEditing: boolean;
    onChange: (value: DataType) => void;
}

export const TagDataTypeCell = ({ value, isEditing, onChange }: TagDataTypeCellProps) => {
    if (isEditing) {
        return (
            <div className={styles['tagCell__selectWrapper']}>
                <Select
                    value={value ?? 'int16'}
                    onChange={(e) => onChange(e.target.value as DataType)}
                    fullWidth={true}
                    helperText=""
                    className={styles['tagCell__select']}
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
    }

    return <span>{value ?? 'int16'}</span>;
};

