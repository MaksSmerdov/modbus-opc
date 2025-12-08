import { useState, useCallback } from 'react';
import { useDeleteDeviceMutation } from '@/features/settings/device/api/devicesApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';

export function useDeviceDeletion() {
    const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();
    const { showSuccess, showError } = useSnackbar();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

    const handleDeleteClick = useCallback((deviceId: string) => {
        setDeviceToDelete(deviceId);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deviceToDelete) return;
        try {
            await deleteDevice(deviceToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setDeviceToDelete(null);
            showSuccess('Устройство успешно удалено');
        } catch (error) {
            console.error('Ошибка удаления устройства:', error);
            showError('Не удалось удалить устройство');
        }
    }, [deviceToDelete, deleteDevice, showSuccess, showError]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmOpen(false);
        setDeviceToDelete(null);
    }, []);

    return {
        deleteConfirmOpen,
        deviceToDelete,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
    };
}

