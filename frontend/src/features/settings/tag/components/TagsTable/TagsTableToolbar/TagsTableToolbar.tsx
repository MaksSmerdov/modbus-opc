import { Add, Delete, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import styles from './TagsTableToolbar.module.scss';

interface TagsTableToolbarProps {
    onAdd: () => void;
    onBulkDelete?: () => void;
    onSelectAll?: (checked: boolean) => void;
    selectedCount?: number;
    isAllSelected?: boolean;
    isIndeterminate?: boolean;
    disabled?: boolean;
}

export const TagsTableToolbar = ({ 
    onAdd, 
    onBulkDelete,
    onSelectAll,
    selectedCount = 0,
    isAllSelected = false,
    isIndeterminate = false,
    disabled = false 
}: TagsTableToolbarProps) => {
    return (
        <div className={styles['tagsTableToolbar']}>
            <div className={styles['tagsTableToolbar__left']}>
                {onSelectAll && (
                    <button
                        className={styles['tagsTableToolbar__selectAllButton']}
                        onClick={() => onSelectAll(!isAllSelected)}
                        disabled={disabled}
                    >
                        {isIndeterminate ? (
                            <CheckBoxOutlineBlank fontSize="small" />
                        ) : isAllSelected ? (
                            <CheckBox fontSize="small" />
                        ) : (
                            <CheckBoxOutlineBlank fontSize="small" />
                        )}
                        <span>{isAllSelected ? 'Снять выделение' : 'Выбрать все'}</span>
                    </button>
                )}
                {selectedCount > 0 && (
                    <span className={styles['tagsTableToolbar__selectedCount']}>
                        Выбрано: {selectedCount}
                    </span>
                )}
            </div>
            <div className={styles['tagsTableToolbar__right']}>
                {selectedCount > 0 && onBulkDelete && (
                    <button
                        className={styles['tagsTableToolbar__deleteButton']}
                        onClick={onBulkDelete}
                        disabled={disabled}
                    >
                        <Delete fontSize="small" />
                        Удалить выбранные
                    </button>
                )}
                <button
                    className={styles['tagsTableToolbar__addButton']}
                    onClick={onAdd}
                    disabled={disabled}
                >
                    <Add fontSize="small" />
                    Добавить строку
                </button>
            </div>
        </div>
    );
};