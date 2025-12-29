import { Edit } from '@mui/icons-material';
import type { DataType } from '@/features/settings/tag/types';
import styles from './TagCell.module.scss';

interface TagDataTypeCellProps {
    value: DataType | undefined;
    isEditing: boolean;
    onChange: (value: DataType) => void;
    onDataTypeClick?: () => void;
}

export const TagDataTypeCell = ({ 
    value, 
    isEditing, 
    onChange: _onChange,
    onDataTypeClick 
}: TagDataTypeCellProps) => {
    const displayValue = value === 'int32_float32' ? 'int32f32' : (value ?? 'int16');

    if (isEditing && onDataTypeClick) {
        return (
            <div className={styles['tagCell__byteOrderWrapper']}>
                <span className={styles['tagCell__byteOrderValue']}>
                    {displayValue}
                </span>
                <button
                    type="button"
                    className={styles['tagCell__byteOrderButton']}
                    onClick={onDataTypeClick}
                    title="Изменить тип данных"
                >
                    <Edit fontSize="small" />
                </button>
            </div>
        );
    }

    return <span>{displayValue}</span>;
};

