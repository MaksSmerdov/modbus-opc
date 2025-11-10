import { Input } from '@/shared/ui/Input/Input';
import styles from './TagCell.module.scss';

interface TagNumberCellProps {
    value: number | null | undefined;
    isEditing: boolean;
    onChange: (value: number | undefined) => void;
    step?: number;
    min?: number;
    max?: number;
    placeholder?: string;
}

export const TagNumberCell = ({ 
    value, 
    isEditing, 
    onChange, 
    step = 1,
    min,
    max,
    placeholder 
}: TagNumberCellProps) => {
    if (isEditing) {
        const numValue = value === null || value === undefined ? '' : value;
        return (
            <div className={styles['tagCell__inputWrapper']}>
                <Input
                    type="number"
                    value={numValue}
                    onChange={(e) => onChange(
                        e.target.value === '' ? undefined : Number(e.target.value)
                    )}
                    inputProps={{ step, min, max }}
                    fullWidth={true}
                    helperText=""
                    className={styles['tagCell__input']}
                    placeholder={placeholder}
                />
            </div>
        );
    }

    if (value === null || value === undefined) {
        return <span className={styles['tagCell__empty']}>—</span>;
    }

    return <span>{value}</span>;
};

