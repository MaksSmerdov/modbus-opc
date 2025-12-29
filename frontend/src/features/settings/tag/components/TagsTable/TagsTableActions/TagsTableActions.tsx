import { Delete, Edit, Save, Cancel, Info, ContentCopy, MoreVert } from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import { useState, useCallback, useRef } from 'react';
import styles from './TagsTableActions.module.scss';

interface TagsTableActionsProps {
    isEditing: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onClone?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    onDetails?: () => void;
    disabled?: boolean;
    isSaving?: boolean;
    isDeleting?: boolean;
    isCloning?: boolean;
}

export const TagsTableActions = ({
    isEditing,
    onEdit,
    onDelete,
    onClone,
    onSave,
    onCancel,
    onDetails,
    disabled = false,
    isSaving = false,
    isDeleting = false,
    isCloning = false,
}: TagsTableActionsProps) => {
    const [actionsAnchorEl, setActionsAnchorEl] = useState<HTMLButtonElement | null>(null);
    const actionsButtonRef = useRef<HTMLButtonElement | null>(null);
    const isActionsOpen = Boolean(actionsAnchorEl);

    const handleActionsClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Предотвращаем всплытие события, чтобы не выделялась строка
        if (actionsButtonRef.current) {
            setActionsAnchorEl(actionsButtonRef.current);
        }
    }, []);

    const handleActionsClose = useCallback(() => {
        setActionsAnchorEl(null);
    }, []);

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
        <>
            <div className={styles['tagsTableActions']}>
                <button
                    ref={actionsButtonRef}
                    className={styles['tagsTableActions__button']}
                    onClick={handleActionsClick}
                    disabled={disabled}
                    title="Действия"
                >
                    <MoreVert fontSize="small" />
                </button>
            </div>
            <Menu
                anchorEl={actionsAnchorEl}
                open={isActionsOpen}
                onClose={handleActionsClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                classes={{ paper: styles['tagsTableActions__menu'] }}
            >
                {onDetails && (
                    <MenuItem
                        onClick={() => {
                            handleActionsClose();
                            onDetails();
                        }}
                        disabled={disabled}
                        className={styles['tagsTableActions__menuItem']}
                    >
                        <Info fontSize="small" />
                        <span className={styles['tagsTableActions__menuText']}>Дополнительные параметры</span>
                    </MenuItem>
                )}
                {onEdit && (
                    <MenuItem
                        onClick={() => {
                            handleActionsClose();
                            onEdit();
                        }}
                        disabled={disabled}
                        className={styles['tagsTableActions__menuItem']}
                    >
                        <Edit fontSize="small" />
                        <span className={styles['tagsTableActions__menuText']}>Редактировать</span>
                    </MenuItem>
                )}
                {onClone && (
                    <MenuItem
                        onClick={() => {
                            handleActionsClose();
                            onClone();
                        }}
                        disabled={disabled || isCloning}
                        className={styles['tagsTableActions__menuItem']}
                    >
                        <ContentCopy fontSize="small" />
                        <span className={styles['tagsTableActions__menuText']}>Клонировать</span>
                    </MenuItem>
                )}
                {onDelete && (
                    <MenuItem
                        onClick={() => {
                            handleActionsClose();
                            onDelete();
                        }}
                        disabled={disabled || isDeleting}
                        className={styles['tagsTableActions__menuItem']}
                    >
                        <Delete fontSize="small" />
                        <span className={styles['tagsTableActions__menuText']}>Удалить</span>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};