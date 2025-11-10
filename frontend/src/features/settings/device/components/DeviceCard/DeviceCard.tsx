
import { memo, useMemo, useCallback } from 'react';
import { Delete, Edit, PowerSettingsNew, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { transliterate } from '@/shared/utils/transliterate';
import { useGetTagsQuery } from '@/features/settings/tag/api/tagsApi';
import { IconButton } from '@/shared/ui/IconButton';
import { useThrottle } from '@/shared/hooks/useThrottle';
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

    // Получаем теги устройства
    const { data: tags = [], isLoading: isLoadingTags } = useGetTagsQuery(device._id, {
        skip: !device._id, // Пропускаем запрос, если нет deviceId
    });

    const tagsCount = useMemo(() => tags.length, [tags.length]);

    // Функция для правильного склонения слова "тэг"
    const getTagsLabel = useCallback((count: number): string => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;

        // Исключения для 11-14
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return 'тэгов';
        }

        // 1, 21, 31, 41... - "тэг"
        if (lastDigit === 1) {
            return 'тэг';
        }

        // 2-4, 22-24, 32-34... - "тэга"
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'тэга';
        }

        // 5-20, 25-30, 35-40... - "тэгов"
        return 'тэгов';
    }, []);

    const tagsLabel = useMemo(() => getTagsLabel(tagsCount), [tagsCount, getTagsLabel]);

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

    const handleToggleInternal = useCallback(() => {
        if (onToggleActive) {
            onToggleActive(device);
        }
    }, [onToggleActive, device]);

    const { throttledFn: handleToggle, isLoading: isToggling } = useThrottle(handleToggleInternal, 1000);

    const handleToggleLog = useCallback(() => {
        if (onToggleLogData) {
            onToggleLogData(device);
        }
    }, [onToggleLogData, device]);

    return (
        <div className={styles['deviceCard']} onClick={handleCardClick}>
            <div className={styles['deviceCard__header']}>
                <div className={styles['deviceCard__title']}>
                    <div className={styles['deviceCard__nameWrapper']}>
                        <h4 className={styles['deviceCard__name']} title={device.name}>
                            {device.name}
                        </h4>
                        {!isLoadingTags && (
                            <span className={styles['deviceCard__tagsCount']}>
                                [{tagsCount} {tagsLabel}]
                            </span>
                        )}
                    </div>
                    <div className={styles['deviceCard__actions']} onClick={(e) => e.stopPropagation()}>
                        {onToggleActive && (
                            <IconButton
                                icon={<PowerSettingsNew fontSize="small" />}
                                tooltip={device.isActive ? 'Выключить устройство' : 'Включить устройство'}
                                variant="power"
                                active={device.isActive}
                                onClick={handleToggle}
                                isLoading={isToggling}
                            />
                        )}
                        {onToggleLogData && (
                            <IconButton
                                icon={<Description fontSize="small" />}
                                tooltip={device.logData ? 'Выключить логирование данных' : 'Включить логирование данных'}
                                variant="log"
                                active={device.logData}
                                disabled={isToggling}
                                onClick={handleToggleLog}
                            />
                        )}
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
            <div className={styles['deviceCard__info']}>
                <span className={styles['deviceCard__infoText']}>
                    Slave ID: {device.slaveId}
                </span>
                <span className={styles['deviceCard__infoText']}>
                    Интервал сохранения: {`${device.saveInterval / 1000}`} сек.
                </span>
                <span className={styles['deviceCard__infoText']}>
                    Таймаут: {device.timeout} мс
                </span>
            </div>
        </div>
    );
});