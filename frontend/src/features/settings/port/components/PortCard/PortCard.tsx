import { Settings, Delete, Edit, PowerSettingsNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import type { Port } from '../../types';
import { transliterate } from '@/shared/utils/transliterate';
import { IconButton } from '@/shared/ui/IconButton';
import { useThrottle } from '@/shared/hooks/useThrottle';
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

    const handleToggleInternal = useCallback(() => {
        if (onToggleActive) {
            onToggleActive(port);
        }
    }, [onToggleActive, port]);

    const { throttledFn: handleToggle, isLoading: isToggling } = useThrottle(handleToggleInternal, 1000);

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
                            <IconButton
                                icon={<PowerSettingsNew fontSize="small" />}
                                tooltip={port.isActive ? 'Выключить порт' : 'Включить порт'}
                                variant="power"
                                active={port.isActive}
                                onClick={handleToggle}
                                isLoading={isToggling}
                            />
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
                        <IconButton
                            icon={<Edit fontSize="small" />}
                            tooltip={getEditTooltip}
                            variant="edit"
                            disabled={isEditDeleteDisabled || isToggling}
                            onClick={handleEdit}
                        />
                    )}
                    {onDelete && (
                        <IconButton
                            icon={<Delete fontSize="small" />}
                            tooltip={getDeleteTooltip}
                            variant="delete"
                            disabled={isEditDeleteDisabled || isToggling}
                            onClick={handleDelete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

