import { Save, Cancel, Info, ContentCopy } from '@mui/icons-material';
import styles from './TagsTableActions.module.scss';

interface TagsTableActionsProps {
    isEditing: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    onDetails?: () => void;
    onClone?: () => void;
    isSaving?: boolean;
    isCloning?: boolean;
    disabled?: boolean;
}

export const TagsTableActions = ({
    isEditing,
    onSave,
    onCancel,
    onDetails,
    onClone,
    isSaving = false,
    isCloning = false,
    disabled = false,
}: TagsTableActionsProps) => {
    if (isEditing) {
        return (
            <div className={styles['tagsTableActions']}>
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave?.();
                    }}
                    disabled={isSaving}
                    title="Сохранить"
                >
                    <Save fontSize="small" />
                </button>
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel?.();
                    }}
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
                    onClick={(e) => {
                        e.stopPropagation();
                        onDetails();
                    }}
                    disabled={disabled}
                    title="Дополнительные параметры"
                >
                    <Info fontSize="small" />
                </button>
            )}
            {onClone && (
                <button
                    className={styles['tagsTableActions__button']}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClone();
                    }}
                    disabled={disabled || isCloning}
                    title="Клонировать"
                >
                    <ContentCopy fontSize="small" />
                </button>
            )}
        </div>
    );
};
