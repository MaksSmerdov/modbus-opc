import { Input } from '@/shared/ui/Input/Input';
import styles from './TagCell.module.scss';

interface TagTextCellProps {
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const TagTextCell = ({ value, isEditing, onChange, placeholder }: TagTextCellProps) => {
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
                    placeholder={placeholder}
                />
            </div>
        );
    }

    if (value === null || value === undefined || value === '') {
        return <span className={styles['tagCell__empty']}>—</span>;
    }

    return <span>{value}</span>;
};

