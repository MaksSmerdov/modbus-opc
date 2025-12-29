import { useCallback } from 'react';
import { useClonePortMutation } from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import type { Port } from '@/features/settings/port/types';

export function usePortClone() {
    const [clonePort, { isLoading }] = useClonePortMutation();
    const { showSuccess, showError } = useSnackbar();

    const handleClone = useCallback(async (port: Port) => {
        try {
            await clonePort(port._id).unwrap();
            showSuccess('Порт успешно скопирован');
        } catch (error) {
            console.error('Ошибка клонирования порта:', error);
            showError('Не удалось скопировать порт');
        }
    }, [clonePort, showSuccess, showError]);

    return { handleClone, isCloning: isLoading };
}

