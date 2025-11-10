import { MenuItem } from '@mui/material';
import { Select } from '@/shared/ui/Select/Select';
import type { FunctionCode } from '../../../types';
import styles from './TagCell.module.scss';

interface TagFunctionCodeCellProps {
    value: FunctionCode | undefined;
    isEditing: boolean;
    onChange: (value: FunctionCode) => void;
}

export const TagFunctionCodeCell = ({ value, isEditing, onChange }: TagFunctionCodeCellProps) => {
    if (isEditing) {
        return (
            <div className={styles['tagCell__selectWrapper']}>
                <Select
                    value={value ?? 'holding'}
                    onChange={(e) => onChange(e.target.value as FunctionCode)}
                    fullWidth={true}
                    helperText=""
                    className={styles['tagCell__select']}
                >
                    <MenuItem value="holding">holding</MenuItem>
                    <MenuItem value="input">input</MenuItem>
                    <MenuItem value="coil">coil</MenuItem>
                    <MenuItem value="discrete">discrete</MenuItem>
                </Select>
            </div>
        );
    }

    return <span>{value ?? 'holding'}</span>;
};

