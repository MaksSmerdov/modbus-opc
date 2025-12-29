import { useState, useCallback } from 'react';
import { useDeletePortMutation } from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';

export function usePortDeletion() {
    const [deletePort, { isLoading: isDeleting }] = useDeletePortMutation();
    const { showSuccess, showError } = useSnackbar();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [portToDelete, setPortToDelete] = useState<string | null>(null);
    const [devicesCount, setDevicesCount] = useState<number>(0);

    const handleDeleteClick = useCallback((portId: string, devicesCount: number) => {
        setPortToDelete(portId);
        setDevicesCount(devicesCount);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!portToDelete) return;
        try {
            await deletePort(portToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setPortToDelete(null);
            setDevicesCount(0);
            showSuccess('Порт успешно удален');
        } catch (error) {
            console.error('Ошибка удаления порта:', error);
            showError('Не удалось удалить порт');
        }
    }, [portToDelete, deletePort, showSuccess, showError]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmOpen(false);
        setPortToDelete(null);
        setDevicesCount(0);
    }, []);

    return {
        deleteConfirmOpen,
        portToDelete,
        devicesCount,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
    };
}