import { Add, Delete, CheckBox, CheckBoxOutlineBlank, SwapVert } from '@mui/icons-material';
import { Button } from '@/shared/ui/Button/Button';
import styles from './TagsTableToolbar.module.scss';

interface TagsTableToolbarProps {
    onAdd: () => void;
    onBulkDelete?: () => void;
    onSelectAll?: (checked: boolean) => void;
    selectedCount?: number;
    isAllSelected?: boolean;
    isIndeterminate?: boolean;
    disabled?: boolean;
    reorderMode?: boolean;
    onReorderModeChange?: (enabled: boolean) => void;
}

export const TagsTableToolbar = ({ 
    onAdd, 
    onBulkDelete,
    onSelectAll,
    selectedCount = 0,
    isAllSelected = false,
    isIndeterminate = false,
    disabled = false,
    reorderMode = false,
    onReorderModeChange,
}: TagsTableToolbarProps) => {
    return (
        <div className={styles['tagsTableToolbar']}>
            <div className={styles['tagsTableToolbar__left']}>
                {onSelectAll && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onSelectAll(!isAllSelected)}
                        disabled={disabled}
                        startIcon={
                            isIndeterminate ? (
                                <CheckBoxOutlineBlank fontSize="small" />
                            ) : isAllSelected ? (
                                <CheckBox fontSize="small" />
                            ) : (
                                <CheckBoxOutlineBlank fontSize="small" />
                            )
                        }
                    >
                        {isAllSelected ? 'Снять выделение' : 'Выбрать все'}
                    </Button>
                )}
                {selectedCount > 0 && (
                    <span className={styles['tagsTableToolbar__selectedCount']}>
                        Выбрано: {selectedCount}
                    </span>
                )}
            </div>
            <div className={styles['tagsTableToolbar__right']}>
                {onReorderModeChange && (
                    <Button
                        variant={reorderMode ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => onReorderModeChange(!reorderMode)}
                        disabled={disabled}
                        startIcon={<SwapVert fontSize="small" />}
                        title={reorderMode ? 'Выйти из режима перестановки' : 'Включить режим перестановки'}
                    >
                        {reorderMode ? 'Завершить перестановку' : 'Переставить теги'}
                    </Button>
                )}
                {onBulkDelete && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onBulkDelete}
                        disabled={disabled || selectedCount === 0}
                        startIcon={<Delete fontSize="small" />}
                        className={styles['tagsTableToolbar__deleteButton']}
                    >
                        Удалить выбранные
                    </Button>
                )}
                <Button
                    variant="contained"
                    size="small"
                    onClick={onAdd}
                    disabled={disabled}
                    startIcon={<Add fontSize="small" />}
                >
                    Добавить строку
                </Button>
            </div>
        </div>
    );
};