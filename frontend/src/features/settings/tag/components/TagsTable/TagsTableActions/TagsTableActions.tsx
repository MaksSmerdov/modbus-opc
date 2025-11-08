import { Delete, Edit, Save, Cancel, Info } from '@mui/icons-material';
import styles from './TagsTableActions.module.scss';

interface TagsTableActionsProps {
    isEditing: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    onDetails?: () => void;
    disabled?: boolean;
    isSaving?: boolean;
    isDeleting?: boolean;
}

export const TagsTableActions = ({
    isEditing,
    onEdit,
    onDelete,
    onSave,
    onCancel,
    onDetails,
    disabled = false,
    isSaving = false,
    isDeleting = false,
}: TagsTableActionsProps) => {
    if (isEditing) {
        return (
            <div className={styles['tagsTableActions']}>
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={onSave}
                    disabled={isSaving}
                    title="Сохранить"
                >
                    <Save fontSize="small" />
                </button>
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={onCancel}
                    disabled={isSaving}
                    title="Отмена"
                >
                    <Cancel fontSize="small" />
                </button>
            </div>
        );
    }

    return (
        <div className={styles['tagsTableActions']}>
            {onDetails && (
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={onDetails}
                    disabled={disabled}
                    title="Дополнительные параметры"
                >
                    <Info fontSize="small" />
                </button>
            )}
            {onEdit && (
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={onEdit}
                    disabled={disabled}
                    title="Редактировать"
                >
                    <Edit fontSize="small" />
                </button>
            )}
            {onDelete && (
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={onDelete}
                    disabled={disabled || isDeleting}
                    title="Удалить"
                >
                    <Delete fontSize="small" />
                </button>
            )}
        </div>
    );
};