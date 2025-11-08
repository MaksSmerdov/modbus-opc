import { Settings, Delete, Edit, PowerSettingsNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import type { Port } from '../../types';
import { transliterate } from '@/shared/utils/transliterate';
import styles from './PortCard.module.scss';
import { memo, useMemo, useCallback } from 'react';

interface PortCardProps {
    port: Port;
    devicesCount?: number;
    onEdit?: (port: Port) => void;
    onDelete?: (portId: string) => void;
    onToggleActive?: (port: Port) => void;
    isPollingActive?: boolean;
    isCollapsed?: boolean;
}

export const PortCard = memo(({
    port,
    devicesCount = 0,
    onEdit,
    onDelete,
    onToggleActive,
    isPollingActive = false,
    isCollapsed = false
}: PortCardProps) => {
    const navigate = useNavigate();

    const portInfo = useMemo(() => {
        if (port.connectionType === 'RTU') {
            return `${port.port}`;
        } else {
            return `${port.host}:${port.tcpPort}`;
        }
    }, [port]);

    const handleCardClick = useCallback((e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке редактирования/удаления
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        const slug = transliterate(port.name);
        navigate(`/${slug}`);
    }, [port.name, navigate]);

    // Блокируем редактирование/удаление если опрос включен И порт активен
    const isEditDeleteDisabled = useMemo(() => isPollingActive && port.isActive, [isPollingActive, port.isActive]);

    const getEditTooltip = useMemo((): string => {
        if (!onEdit) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите порт, чтобы редактировать его';
        }
        return 'Редактировать';
    }, [onEdit, isEditDeleteDisabled]);

    const getDeleteTooltip = useMemo((): string => {
        if (!onDelete) return '';
        if (isEditDeleteDisabled) {
            return 'Сначала выключите порт, чтобы удалить его';
        }
        return 'Удалить';
    }, [onDelete, isEditDeleteDisabled]);

    const handleEdit = useCallback(() => {
        if (onEdit) {
            onEdit(port);
        }
    }, [onEdit, port]);

    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete(port._id);
        }
    }, [onDelete, port._id]);

    const handleToggle = useCallback(() => {
        if (onToggleActive) {
            onToggleActive(port);
        }
    }, [onToggleActive, port]);

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
                    <Tooltip title={port.name} arrow>
                        <h4 className={styles['portCard__name']}>
                            {port.name}
                        </h4>
                    </Tooltip>
                    <div className={styles['portCard__actions']} onClick={(e) => e.stopPropagation()}>
                        {onToggleActive && (
                            <Tooltip title={port.isActive ? 'Выключить порт' : 'Включить порт'} arrow>
                                <button
                                    className={`${styles['portCard__actionButton']} ${styles['portCard__actionButton_power']} ${port.isActive ? styles['portCard__actionButton_power_active'] : ''}`}
                                    onClick={handleToggle}
                                >
                                    <PowerSettingsNew fontSize="small" />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles['portCard__info']}>
                <span className={styles['portCard__infoText']}>{portInfo}</span>
                {devicesCount > 0 && (
                    <span className={styles['portCard__devicesCount']}>
                        [{devicesCount} {devicesCount === 1 ? 'уст-во' : devicesCount < 5 ? 'уст-ва' : 'уст-в'}]
                    </span>
                )}
                <div className={styles['portCard__actions']}>

                    {onEdit && (
                        <Tooltip title={getEditTooltip} arrow>
                            <span>
                                <button
                                    className={styles['portCard__actionButton']}
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
                                    className={styles['portCard__actionButton']}
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
    );
});

