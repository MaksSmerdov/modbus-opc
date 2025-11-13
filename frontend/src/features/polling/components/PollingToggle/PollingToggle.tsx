import { useState, useCallback, useMemo } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useGetPollingStatusQuery, useStartPollingMutation, useStopPollingMutation } from '../../api/pollingApi';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { useThrottle } from '@/shared/hooks/useThrottle';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import styles from './PollingToggle.module.scss';

export const PollingToggle = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { data: status, isLoading: isLoadingStatus } = useGetPollingStatusQuery(undefined, {
        pollingInterval: 5000,
    });
    const pollInterval = useMemo(() => status?.pollInterval ?? 5000, [status?.pollInterval]);
    const { data: updatedStatus } = useGetPollingStatusQuery(undefined, {
        pollingInterval: pollInterval,
        skip: !status,
    });
    const { showSuccess, showError } = useSnackbar();

    const currentStatus = updatedStatus ?? status;

    const [startPolling, { isLoading: isStarting }] = useStartPollingMutation();
    const [stopPolling, { isLoading: isStopping }] = useStopPollingMutation();

    const isPolling = currentStatus?.isPolling ?? false;
    const hasManager = currentStatus?.hasManager ?? false;
    const isLoading = isLoadingStatus || isStarting || isStopping;

    const handleToggleInternal = useCallback(async () => {
        try {
            if (isPolling) {
                await stopPolling().unwrap();
                showError('Опрос устройств остановлен');
            } else {
                await startPolling().unwrap();
                showSuccess('Опрос устройств запущен');
            }
            setErrorMessage(null);
        } catch (error) {
            console.error('Ошибка управления опросом:', error);
            const errorData = error as { data?: { error?: string; message?: string } };
            const message = errorData?.data?.message || errorData?.data?.error || 'Не удалось выполнить операцию';
            setErrorMessage(message);
        }
    }, [isPolling, startPolling, stopPolling]);

    const { throttledFn: handleToggle, isLoading: isThrottling } = useThrottle(handleToggleInternal, 1000);

    const getTooltipTitle = (): string => {
        if (isLoading || isThrottling) {
            return 'Обработка...';
        }
        if (!hasManager) {
            return 'Modbus не инициализирован.';
        }
        if (isPolling) {
            return 'Остановить опрос устройств';
        }
        return 'Запустить опрос устройств';
    };

    const isButtonLoading = isLoading || isThrottling;
    const isButtonDisabled = isButtonLoading || !hasManager;

    return (
        <>
            <IconButton
                icon={isPolling ? <Stop /> : <PlayArrow />}
                onClick={handleToggle}
                disabled={isButtonDisabled}
                active={isPolling}
                isLoading={isButtonLoading}
                className={`${styles['pollingToggle']} ${isPolling ? styles['pollingToggle_active'] : ''}`}
                tooltip={getTooltipTitle()}
            />
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

