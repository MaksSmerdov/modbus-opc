import { useState, useCallback } from 'react';
import { useDeletePortMutation } from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';

export function usePortDeletion() {
    const [deletePort, { isLoading: isDeleting }] = useDeletePortMutation();
    const { showSuccess, showError } = useSnackbar();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [portToDelete, setPortToDelete] = useState<string | null>(null);

    const handleDeleteClick = useCallback((portId: string) => {
        setPortToDelete(portId);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!portToDelete) return;
        try {
            await deletePort(portToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setPortToDelete(null);
            showSuccess('Порт успешно удален');
        } catch (error) {
            console.error('Ошибка удаления порта:', error);
            showError('Не удалось удалить порт');
        }
    }, [portToDelete, deletePort, showSuccess, showError]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmOpen(false);
        setPortToDelete(null);
    }, []);

    return {
        deleteConfirmOpen,
        portToDelete,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
    };
}

