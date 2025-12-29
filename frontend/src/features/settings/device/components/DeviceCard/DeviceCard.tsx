import { memo, useMemo, useCallback } from 'react';
import { Delete, Edit, PowerSettingsNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { transliterate } from '@/shared/utils/transliterate';
import { useGetTagsQuery } from '@/features/settings/tag/api/tagsApi';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { useThrottle } from '@/shared/hooks/useThrottle';
import {
  formatTagsCount,
  formatSaveInterval,
  getEditTooltip,
  getDeleteTooltip,
} from '@/features/settings/device/utils/deviceUtils';
import type { Device } from '@/features/settings/device/types';
import styles from './DeviceCard.module.scss';

interface DeviceCardProps {
  device: Device;
  portSlug?: string;
  onEdit?: (device: Device) => void;
  onDelete?: (deviceId: string) => void;
  onToggleActive?: (device: Device) => void;
  isPollingActive?: boolean;
}

export const DeviceCard = memo(
  ({ device, portSlug, onEdit, onDelete, onToggleActive, isPollingActive = false }: DeviceCardProps) => {
    const navigate = useNavigate();
    const isEditDeleteDisabled = useMemo(() => isPollingActive && device.isActive, [isPollingActive, device.isActive]);

    // Получаем теги устройства
    const { data: tags = [], isLoading: isLoadingTags } = useGetTagsQuery(device._id, {
      skip: !device._id, // Пропускаем запрос, если нет deviceId
    });

    const tagsCount = useMemo(() => tags.length, [tags.length]);
    const tagsCountText = useMemo(() => formatTagsCount(tagsCount), [tagsCount]);

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        if (portSlug) {
          const deviceSlug = transliterate(device.slug || device.name);
          navigate(`/${portSlug}/${deviceSlug}`);
        }
      },
      [portSlug, device.slug, device.name, navigate]
    );

    const editTooltip = useMemo(() => {
      if (!onEdit) return '';
      return getEditTooltip(isEditDeleteDisabled);
    }, [onEdit, isEditDeleteDisabled]);

    const deleteTooltip = useMemo(() => {
      if (!onDelete) return '';
      return getDeleteTooltip(isEditDeleteDisabled);
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

    return (
      <li className={styles['deviceCard']} onClick={handleCardClick}>
        <div className={styles['deviceCard__header']}>
          <div className={styles['deviceCard__title']}>
            <div className={styles['deviceCard__nameWrapper']}>
              <h4 className={styles['deviceCard__name']} title={device.name}>
                {device.name}
              </h4>
              {!isLoadingTags && tagsCountText && (
                <span className={styles['deviceCard__tagsCount']}>{tagsCountText}</span>
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
              {onEdit && (
                <IconButton
                  icon={<Edit fontSize="small" />}
                  tooltip={editTooltip}
                  variant="edit"
                  disabled={isEditDeleteDisabled || isToggling}
                  onClick={handleEdit}
                />
              )}
              {onDelete && (
                <IconButton
                  icon={<Delete fontSize="small" />}
                  tooltip={deleteTooltip}
                  variant="delete"
                  disabled={isEditDeleteDisabled || isToggling}
                  onClick={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles['deviceCard__info']}>
          <span className={styles['deviceCard__infoText']}>Slave ID: {device.slaveId}</span>
          <span className={styles['deviceCard__infoText']}>
            Интервал сохранения: {formatSaveInterval(device.saveInterval)}
          </span>
          <span className={styles['deviceCard__infoText']}>Таймаут: {device.timeout} мс</span>
        </div>
      </li>
    );
  }
);
