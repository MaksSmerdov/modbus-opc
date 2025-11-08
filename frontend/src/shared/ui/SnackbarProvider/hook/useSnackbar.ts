import { useSnackbar as useNotistackSnackbar } from 'notistack';

export const useSnackbar = () => {
    const { enqueueSnackbar, closeSnackbar } = useNotistackSnackbar();

    const showSuccess = (message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'success',
            autoHideDuration: duration || 6000,
        });
    };

    const showError = (message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'error',
            autoHideDuration: duration || 6000,
        });
    };

    const showWarning = (message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'warning',
            autoHideDuration: duration || 6000,
        });
    };

    const showInfo = (message: string, duration?: number) => {
        enqueueSnackbar(message, {
            variant: 'info',
            autoHideDuration: duration || 6000,
        });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        closeSnackbar,
    };
};
