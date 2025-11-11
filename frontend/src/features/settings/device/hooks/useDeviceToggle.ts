import { useCallback } from 'react';
import { useUpdateDeviceMutation } from '../api/devicesApi';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import type { Device } from '../types';

export function useDeviceToggle() {
    const [updateDevice] = useUpdateDeviceMutation();
    const { showSuccess, showError } = useSnackbar();

    const handleToggleDeviceActive = useCallback(async (device: Device) => {
        try {
            await updateDevice({
                id: device._id,
                data: { isActive: !device.isActive },
            }).unwrap();
            showSuccess(device.isActive ? 'Устройство выключено' : 'Устройство включено');
        } catch (error) {
            console.error('Ошибка переключения активности устройства:', error);
            showError('Не удалось изменить статус устройства');
        }
    }, [updateDevice, showSuccess, showError]);

    return { handleToggleDeviceActive };
}

