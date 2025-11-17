import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import classNames from 'classnames';
import type { ReactNode, SyntheticEvent } from 'react';
import styles from './Modal.module.scss';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    onExited?: () => void;
    title?: string;
    children: ReactNode;
    actions?: ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    className?: string;
    disableBackdropClick?: boolean;
    disableEscapeKeyDown?: boolean;
}

export const Modal = ({
    open,
    onClose,
    onExited,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true,
    className,
    disableBackdropClick = false,
    disableEscapeKeyDown = false,
}: ModalProps) => {
    const handleClose = (_event: SyntheticEvent, reason?: string) => {
        if (disableBackdropClick && reason === 'backdropClick') {
            return;
        }
        if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
            return;
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={onExited ? { transition: { onExited } } : undefined}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            className={classNames(styles['modal'], className)}
            classes={{
                paper: styles['modal__paper'],
            }}
        >
            {title && (
                <DialogTitle className={styles['modal__title']}>
                    <span>{title}</span>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        className={styles['modal__closeButton']}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            )}
            <DialogContent className={styles['modal__content']}>{children}</DialogContent>
            {actions && <DialogActions className={styles['modal__actions']}>{actions}</DialogActions>}
        </Dialog>
    );
};

