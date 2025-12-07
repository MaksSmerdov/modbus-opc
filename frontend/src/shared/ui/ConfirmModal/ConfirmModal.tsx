import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'contained' | 'outlined' | 'text';
    isLoading?: boolean;
}

export const ConfirmModal = ({
    open,
    onClose,
    onConfirm,
    title = 'Подтверждение',
    message,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    confirmVariant = 'contained',
    isLoading = false,
}: ConfirmModalProps) => {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={isLoading}
            disableBackdropClick={isLoading}
        >
            <div className={styles['confirmModal']}>
                {typeof message === 'string' ? (
                    <p className={styles['confirmModal__message']}>{message}</p>
                ) : (
                    <div className={styles['confirmModal__message']}>{message}</div>
                )}
                <div className={styles['confirmModal__actions']}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={isLoading}
                        fullWidth
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        fullWidth
                    >
                        {isLoading ? 'Обработка...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

