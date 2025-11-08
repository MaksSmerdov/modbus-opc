import { useState } from 'react';
import { IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useGetPollingStatusQuery, useStartPollingMutation, useStopPollingMutation } from '../../api/pollingApi';
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

    const handleToggle = async () => {
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
    };

    const getTooltipTitle = (): string => {
        if (isLoading) {
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

    return (
        <>
            <Tooltip title={getTooltipTitle()} arrow>
                <span>
                    <IconButton
                        onClick={handleToggle}
                        disabled={isLoading || !hasManager}
                        className={`${styles['pollingToggle']} ${isPolling ? styles['pollingToggle_active'] : ''}`}
                        size="small"
                    >
                        {isLoading ? (
                            <CircularProgress size={20} />
                        ) : isPolling ? (
                            <Stop />
                        ) : (
                            <PlayArrow />
                        )}
                    </IconButton>
                </span>
            </Tooltip>
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

