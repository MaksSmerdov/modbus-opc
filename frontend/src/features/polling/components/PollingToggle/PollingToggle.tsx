import { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useGetPollingStatusQuery, useStartPollingMutation, useStopPollingMutation } from '../../api/pollingApi';
import { IconButton } from '@/shared/ui/IconButton';
import { useThrottle } from '@/shared/hooks/useThrottle';
import styles from './PollingToggle.module.scss';

export const PollingToggle = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { data: status, isLoading: isLoadingStatus } = useGetPollingStatusQuery(undefined, {
        pollingInterval: 2000, // Обновляем статус каждые 2 секунды
    });
    const [startPolling, { isLoading: isStarting }] = useStartPollingMutation();
    const [stopPolling, { isLoading: isStopping }] = useStopPollingMutation();

    const isPolling = status?.isPolling ?? false;
    const hasManager = status?.hasManager ?? false;
    const isLoading = isLoadingStatus || isStarting || isStopping;

    const handleToggleInternal = useCallback(async () => {
        try {
            if (isPolling) {
                await stopPolling().unwrap();
            } else {
                await startPolling().unwrap();
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
                variant="default"
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

