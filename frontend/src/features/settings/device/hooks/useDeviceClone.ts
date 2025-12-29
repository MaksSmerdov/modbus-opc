import { useCallback } from 'react';
import { useCloneDeviceMutation } from '@/features/settings/device/api/devicesApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import type { Device } from '@/features/settings/device/types';

export function useDeviceClone() {
    const [cloneDevice, { isLoading }] = useCloneDeviceMutation();
    const { showSuccess, showError } = useSnackbar();

    const handleClone = useCallback(async (device: Device) => {
        try {
            await cloneDevice(device._id).unwrap();
            showSuccess('Устройство успешно скопировано');
        } catch (error) {
            console.error('Ошибка клонирования устройства:', error);
            showError('Не удалось скопировать устройство');
        }
    }, [cloneDevice, showSuccess, showError]);

    return { handleClone, isCloning: isLoading };
}

