import { Edit } from '@mui/icons-material';
import type { FunctionCode } from '@/features/settings/tag/types';
import styles from './TagCell.module.scss';

interface TagFunctionCodeCellProps {
    value: FunctionCode | undefined;
    isEditing: boolean;
    onChange: (value: FunctionCode) => void;
    onFunctionCodeClick?: () => void;
}

export const TagFunctionCodeCell = ({ 
    value, 
    isEditing, 
    onChange: _onChange,
    onFunctionCodeClick 
}: TagFunctionCodeCellProps) => {
    const displayValue = value ?? 'holding';

    if (isEditing && onFunctionCodeClick) {
        return (
            <div className={styles['tagCell__byteOrderWrapper']}>
                <span className={styles['tagCell__byteOrderValue']}>
                    {displayValue}
                </span>
                <button
                    type="button"
                    className={styles['tagCell__byteOrderButton']}
                    onClick={onFunctionCodeClick}
                    title="Изменить код функции"
                >
                    <Edit fontSize="small" />
                </button>
            </div>
        );
    }

    return <span>{displayValue}</span>;
};

