import { Edit } from '@mui/icons-material';
import type { ByteOrder } from '../../../types';
import styles from './TagCell.module.scss';

interface TagByteOrderCellProps {
    value: ByteOrder | undefined;
    isEditing: boolean;
    onChange: (value: ByteOrder) => void; // Используется через onByteOrderClick -> модальное окно
    onByteOrderClick?: () => void;
}

export const TagByteOrderCell = ({
    value,
    isEditing,
    onChange: _onChange, // Не используется напрямую, изменение через модальное окно
    onByteOrderClick
}: TagByteOrderCellProps) => {
    const displayValue = value ?? 'ABCD';

    if (isEditing && onByteOrderClick) {
        return (
            <div className={styles['tagCell__byteOrderWrapper']}>
                <span className={styles['tagCell__byteOrderValue']}>
                    {displayValue}
                </span>
                <button
                    type="button"
                    className={styles['tagCell__byteOrderButton']}
                    onClick={onByteOrderClick}
                    title="Изменить порядок байтов"
                >
                    <Edit fontSize="small" />
                </button>
            </div>
        );
    }

    return <span>{displayValue}</span>;
};

