import { Tooltip } from '@mui/material';
import { Input } from '@/shared/ui/Input/Input';
import styles from './TagCell.module.scss';

interface TagNameCellProps {
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
}

export const TagNameCell = ({ value, isEditing, onChange }: TagNameCellProps) => {
    if (isEditing) {
        return (
            <div className={styles['tagCell__inputWrapper']}>
                <Input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    fullWidth={true}
                    helperText=""
                    className={styles['tagCell__input']}
                />
            </div>
        );
    }

    if (!value) {
        return <span className={styles['tagCell__empty']}>—</span>;
    }

    return (
        <Tooltip title={value} arrow>
            <span className={styles['tagCell__name']}>
                {value}
            </span>
        </Tooltip>
    );
};

