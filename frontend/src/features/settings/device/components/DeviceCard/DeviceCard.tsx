


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

export const DeviceCard = ({
    device,
    portSlug,
    onEdit,
    onDelete,
    onToggleActive,
    onToggleLogData,
    isPollingActive = false,
}: DeviceCardProps) => {
    const navigate = useNavigate();
    const isEditDeleteDisabled = isPollingActive && device.isActive;

    const handleCardClick = (e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        if (portSlug) {
            const deviceSlug = transliterate(device.slug || device.name);
            navigate(`/${portSlug}/${deviceSlug}`);
        }
    };

    const getEditTooltip = (): string => {
        if (!onEdit) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите устройство, чтобы редактировать его';
        }
        return 'Редактировать';
    };

    const getDeleteTooltip = (): string => {
        if (!onDelete) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите устройство, чтобы удалить его';
        }
        return 'Удалить';
    };

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
                                    onClick={() => onToggleActive(device)}
                                >
                                    <PowerSettingsNew fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                        {onToggleLogData && (
                            <Tooltip title={device.logData ? 'Выключить логирование данных' : 'Включить логирование данных'} arrow>
                                <button
                                    className={`${styles['deviceCard__actionButton']} ${styles['deviceCard__actionButton_log']} ${device.logData ? styles['deviceCard__actionButton_log_active'] : ''}`}
                                    onClick={() => onToggleLogData(device)}
                                >
                                    <Description fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                        {onEdit && (
                            <Tooltip title={getEditTooltip()} arrow>
                                <button
                                    className={styles['deviceCard__actionButton']}
                                    onClick={() => onEdit(device)}
                                    disabled={isEditDeleteDisabled}
                                >
                                    <Edit fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Tooltip title={getDeleteTooltip()} arrow>
                                <button
                                    className={styles['deviceCard__actionButton']}
                                    onClick={() => onDelete(device._id)}
                                    disabled={isEditDeleteDisabled}
                                >
                                    <Delete fontSize="small" />
                                </button>
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
};