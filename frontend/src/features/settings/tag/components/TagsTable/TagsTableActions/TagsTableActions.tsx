import { Save, Cancel, Info, ContentCopy } from '@mui/icons-material';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
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
    const handleClick = (callback?: () => void) => (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e) {
            e.stopPropagation();
        }
        callback?.();
    };

    if (isEditing) {
        return (
            <div className={styles['tagsTableActions']}>
                <IconButton
                    icon={<Save fontSize="small" />}
                    tooltip="Сохранить"
                    onClick={handleClick(onSave)}
                    disabled={isSaving}
                    isLoading={isSaving}
                />
                <IconButton
                    icon={<Cancel fontSize="small" />}
                    tooltip="Отмена"
                    onClick={handleClick(onCancel)}
                    disabled={isSaving}
                />
            </div>
        );
    }

    return (
        <div className={styles['tagsTableActions']}>
            {onDetails && (
                <IconButton
                    icon={<Info fontSize="small" />}
                    tooltip="Дополнительные параметры"
                    onClick={handleClick(onDetails)}
                    disabled={disabled}
                />
            )}
            {onClone && (
                <IconButton
                    icon={<ContentCopy fontSize="small" />}
                    tooltip="Клонировать"
                    onClick={handleClick(onClone)}
                    disabled={disabled || isCloning}
                    isLoading={isCloning}
                />
            )}
        </div>
    );
};
