import { useSnackbar as useNotistackSnackbar } from 'notistack';
import { useCallback } from 'react';

export const useSnackbar = () => {
    const { enqueueSnackbar, closeSnackbar } = useNotistackSnackbar();

    const showSuccess = useCallback((message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'success',
            autoHideDuration: duration || 6000,
        });
    }, [enqueueSnackbar]);

    const showError = useCallback((message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'error',
            autoHideDuration: duration || 6000,
        });
    }, [enqueueSnackbar]);

    const showWarning = useCallback((message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'warning',
            autoHideDuration: duration || 6000,
        });
    }, [enqueueSnackbar]);

    const showInfo = useCallback((message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'info',
            autoHideDuration: duration || 6000,
        });
    }, [enqueueSnackbar]);

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        closeSnackbar,
    };
};
