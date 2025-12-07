import { useCallback } from 'react';
import { useUpdateDeviceMutation } from '@/features/settings/device/api/devicesApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import type { Device } from '@/features/settings/device/types';

export function useDeviceLogToggle() {
    const [updateDevice] = useUpdateDeviceMutation();
    const { showSuccess, showError } = useSnackbar();

    const handleToggleLogData = useCallback(async (device: Device) => {
        try {
            await updateDevice({
                id: device._id,
                data: { logData: !device.logData },
            }).unwrap();
            showSuccess(
                device.logData
                    ? `Логи объекта '${device.name}' выключены`
                    : `Логи объекта '${device.name}' включены`
            );
        } catch (error) {
            console.error('Ошибка переключения логирования данных:', error);
            showError('Не удалось изменить настройку логирования');
        }
    }, [updateDevice, showSuccess, showError]);

    return { handleToggleLogData };
}

