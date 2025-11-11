import { useCallback } from 'react';
import { useUpdatePortMutation } from '../api/portsApi';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import type { Port } from '../types';

export function usePortToggle() {
    const [updatePort] = useUpdatePortMutation();
    const { showSuccess, showError } = useSnackbar();

    const handleTogglePortActive = useCallback(async (port: Port) => {
        try {
            await updatePort({
                id: port._id,
                data: { isActive: !port.isActive },
            }).unwrap();
            showSuccess(port.isActive ? 'Порт выключен' : 'Порт включен');
        } catch (error) {
            console.error('Ошибка переключения активности порта:', error);
            showError('Не удалось изменить статус порта');
        }
    }, [updatePort, showSuccess, showError]);

    return { handleTogglePortActive };
}

