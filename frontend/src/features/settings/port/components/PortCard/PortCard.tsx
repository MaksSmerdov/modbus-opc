import { Settings, Delete, Edit, PowerSettingsNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import type { Port } from '../../types';
import { transliterate } from '@/shared/utils/transliterate';
import styles from './PortCard.module.scss';

interface PortCardProps {
    port: Port;
    onEdit?: (port: Port) => void;
    onDelete?: (portId: string) => void;
    onToggleActive?: (port: Port) => void;
    isPollingActive?: boolean;
    isCollapsed?: boolean;
}

export const PortCard = ({
    port,
    onEdit,
    onDelete,
    onToggleActive,
    isPollingActive = false,
    isCollapsed = false
}: PortCardProps) => {
    const navigate = useNavigate();

    const getPortInfo = () => {
        if (port.connectionType === 'RTU') {
            return `${port.port}`;
        } else {
            return `${port.host}:${port.tcpPort}`;
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке редактирования/удаления
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        const slug = transliterate(port.name);
        navigate(`/${slug}`);
    };

    // Блокируем редактирование/удаление если опрос включен И порт активен
    const isEditDeleteDisabled = isPollingActive && port.isActive;

    const getEditTooltip = (): string => {
        if (!onEdit) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите порт, чтобы редактировать его';
        }
        return 'Редактировать';
    };

    const getDeleteTooltip = (): string => {
        if (!onDelete) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите порт, чтобы удалить его';
        }
        return 'Удалить';
    };

    if (isCollapsed) {
        return (
            <div
                className={styles['portCard']}
                title={port.name}
                onClick={handleCardClick}
            >
                <div className={styles['portCard__icon']}>
                    <Settings />
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles['portCard']}
            onClick={handleCardClick}
        >
            <div className={styles['portCard__header']}>
                <div className={styles['portCard__title']}>
                    <h4 className={styles['portCard__name']} title={port.name}>
                        {port.name}
                    </h4>
                    <div className={styles['portCard__actions']} onClick={(e) => e.stopPropagation()}>
                        {onToggleActive && (
                            <Tooltip title={port.isActive ? 'Выключить порт' : 'Включить порт'} arrow>
                                <button
                                    className={`${styles['portCard__actionButton']} ${styles['portCard__actionButton_power']} ${port.isActive ? styles['portCard__actionButton_power_active'] : ''}`}
                                    onClick={() => onToggleActive(port)}
                                >
                                    <PowerSettingsNew fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles['portCard__info']}>
                <span className={styles['portCard__infoText']}>{getPortInfo()}</span>
                <div className={styles['portCard__actions']}>
                    {onEdit && (
                        <Tooltip title={getEditTooltip()} arrow>
                            <button
                                className={styles['portCard__actionButton']}
                                onClick={() => onEdit(port)}
                                disabled={isEditDeleteDisabled}
                            >
                                <Edit fontSize="small" />
                            </button>
                        </Tooltip>
                    )}
                    {onDelete && (
                        <Tooltip title={getDeleteTooltip()} arrow>
                            <button
                                className={styles['portCard__actionButton']}
                                onClick={() => onDelete(port._id)}
                                disabled={isEditDeleteDisabled}
                            >
                                <Delete fontSize="small" />
                            </button>
                        </Tooltip>
                    )}
                </div>

            </div>
        </div>
    );
};

