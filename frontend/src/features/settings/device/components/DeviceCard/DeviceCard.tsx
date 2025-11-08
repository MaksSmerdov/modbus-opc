
import { memo, useMemo, useCallback } from 'react';
import { Delete, Edit, PowerSettingsNew, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { transliterate } from '@/shared/utils/transliterate';
import type { Device } from '../../types';
import styles from './DeviceCard.module.scss';

interface DeviceCardProps {
    device: Device;
    portSlug?: string;
    onEdit?: (device: Device) => void;
    onDelete?: (deviceId: string) => void;
    onToggleActive?: (device: Device) => void;
    onToggleLogData?: (device: Device) => void;
    isPollingActive?: boolean;
}

export const DeviceCard = memo(({
    device,
    portSlug,
    onEdit,
    onDelete,
    onToggleActive,
    onToggleLogData,
    isPollingActive = false,
}: DeviceCardProps) => {
    const navigate = useNavigate();
    const isEditDeleteDisabled = useMemo(() => isPollingActive && device.isActive, [isPollingActive, device.isActive]);

    const handleCardClick = useCallback((e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        if (portSlug) {
            const deviceSlug = transliterate(device.slug || device.name);
            navigate(`/${portSlug}/${deviceSlug}`);
        }
    }, [portSlug, device.slug, device.name, navigate]);

    const getEditTooltip = useMemo((): string => {
        if (!onEdit) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите устройство, чтобы редактировать его';
        }
        return 'Редактировать';
    }, [onEdit, isEditDeleteDisabled]);

    const getDeleteTooltip = useMemo((): string => {
        if (!onDelete) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите устройство, чтобы удалить его';
        }
        return 'Удалить';
    }, [onDelete, isEditDeleteDisabled]);

    const handleEdit = useCallback(() => {
        if (onEdit) {
            onEdit(device);
        }
    }, [onEdit, device]);

    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete(device._id);
        }
    }, [onDelete, device._id]);

    const handleToggle = useCallback(() => {
        if (onToggleActive) {
            onToggleActive(device);
        }
    }, [onToggleActive, device]);

    const handleToggleLog = useCallback(() => {
        if (onToggleLogData) {
            onToggleLogData(device);
        }
    }, [onToggleLogData, device]);

    return (
        <div className={styles['deviceCard']} onClick={handleCardClick}>
            <div className={styles['deviceCard__header']}>
                <div className={styles['deviceCard__title']}>
                    <h4 className={styles['deviceCard__name']} title={device.name}>
                        {device.name}
                    </h4>
                    <div className={styles['deviceCard__actions']} onClick={(e) => e.stopPropagation()}>
                        {onToggleActive && (
                            <Tooltip title={device.isActive ? 'Выключить устройство' : 'Включить устройство'} arrow>
                                <button
                                    className={`${styles['deviceCard__actionButton']} ${styles['deviceCard__actionButton_power']} ${device.isActive ? styles['deviceCard__actionButton_power_active'] : ''}`}
                                    onClick={handleToggle}
                                >
                                    <PowerSettingsNew fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                        {onToggleLogData && (
                            <Tooltip title={device.logData ? 'Выключить логирование данных' : 'Включить логирование данных'} arrow>
                                <button
                                    className={`${styles['deviceCard__actionButton']} ${styles['deviceCard__actionButton_log']} ${device.logData ? styles['deviceCard__actionButton_log_active'] : ''}`}
                                    onClick={handleToggleLog}
                                >
                                    <Description fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                        {onEdit && (
                            <Tooltip title={getEditTooltip} arrow>
                                <span>
                                    <button
                                        className={styles['deviceCard__actionButton']}
                                        onClick={handleEdit}
                                        disabled={isEditDeleteDisabled}
                                    >
                                        <Edit fontSize="small" />
                                    </button>
                                </span>
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Tooltip title={getDeleteTooltip} arrow>
                                <span>
                                    <button
                                        className={styles['deviceCard__actionButton']}
                                        onClick={handleDelete}
                                        disabled={isEditDeleteDisabled}
                                    >
                                        <Delete fontSize="small" />
                                    </button>
                                </span>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles['deviceCard__info']}>
                <span className={styles['deviceCard__infoText']}>
                    Slave ID: {device.slaveId}
                </span>
            </div>
        </div>
    );
});