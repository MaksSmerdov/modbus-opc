import { useMemo, useCallback, memo } from 'react';
import { useGetDevicesQuery } from '@/features/settings/device/api/devicesApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { DeviceCard } from '@/features/settings/device/components/DeviceCard/DeviceCard';
import { DeviceCardSkeleton } from '@/features/settings/device/components/DeviceCard/DeviceCardSkeleton';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { useDeviceDeletion } from '@/features/settings/device/hooks/useDeviceDeletion';
import { useDeviceToggle } from '@/features/settings/device/hooks/useDeviceToggle';
import { useDeviceClone } from '@/features/settings/device/hooks/useDeviceClone';
import { filterDevicesByPort } from '@/features/settings/device/utils/deviceUtils';
import type { Device } from '@/features/settings/device/types';
import styles from './DevicesList.module.scss';
import { useParams } from 'react-router-dom';

interface DevicesListProps {
    portId: string;
    onEdit?: (device: Device) => void;
}

export const DevicesList = memo(({ portId, onEdit }: DevicesListProps) => {
    const { data: devices, isLoading, error } = useGetDevicesQuery();
    const { isPolling } = useGetPollingStatusQuery(undefined, {
        selectFromResult: ({ data }) => ({
            isPolling: data?.isPolling ?? false,
        }),
    });
    const { user } = useAppSelector((state) => state.auth);

    // Получаем portSlug из URL для навигации
    const { portSlug } = useParams<{ portSlug: string }>();

    const {
        deleteConfirmOpen,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
    } = useDeviceDeletion();

    const { handleToggleDeviceActive } = useDeviceToggle();
    const { handleClone } = useDeviceClone();

    const isPollingActive = useMemo(() => isPolling, [isPolling]);
    const canManageDevices = useMemo(() => user?.role === 'admin' || user?.role === 'operator', [user?.role]);

    // Фильтруем устройства по порту
    const portDevices = useMemo(
        () => filterDevicesByPort(devices, portId),
        [devices, portId]
    );

    // Мемоизировать обработчики для map
    const handleEditDevice = useCallback((device: Device) => {
        if (canManageDevices && onEdit) {
            onEdit(device);
        }
    }, [canManageDevices, onEdit]);

    const handleDeleteDevice = useCallback((deviceId: string) => {
        if (canManageDevices) {
            handleDeleteClick(deviceId);
        }
    }, [canManageDevices, handleDeleteClick]);

    const handleToggleActive = useCallback((device: Device) => {
        if (canManageDevices) {
            handleToggleDeviceActive(device);
        }
    }, [canManageDevices, handleToggleDeviceActive]);

    const handleCloneDevice = useCallback((device: Device) => {
        if (canManageDevices) {
            handleClone(device);
        }
    }, [canManageDevices, handleClone]);

    if (isLoading) {
        return (
            <div className={styles['devicesList']}>
                <DeviceCardSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['devicesList']}>
                <div className={styles['devicesList__error']}>
                    Ошибка загрузки устройств
                </div>
            </div>
        );
    }

    if (portDevices.length === 0) {
        return (
            <div className={styles['devicesList']}>
                <div className={styles['devicesList__empty']}>
                    Нет устройств на этом порту
                </div>
            </div>
        );
    }

    return (
        <>
            <ul className={`${styles['devicesList']} list-reset`}>
                {portDevices.map((device) => {
                    const handleEdit = canManageDevices && onEdit ? () => handleEditDevice(device) : undefined;
                    const handleDelete = canManageDevices ? () => handleDeleteDevice(device._id) : undefined;
                    const handleToggle = canManageDevices ? () => handleToggleActive(device) : undefined;
                    const handleClone = canManageDevices ? () => handleCloneDevice(device) : undefined;

                    return (
                        <DeviceCard
                            key={device._id}
                            device={device}
                            portSlug={portSlug}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggle}
                            onClone={handleClone}
                            isPollingActive={isPollingActive}
                        />
                    );
                })}
            </ul>
            <ConfirmModal
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Удаление устройства"
                message="Вы уверены, что хотите удалить это устройство? Это действие нельзя отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                confirmVariant="contained"
                isLoading={isDeleting}
            />
        </>
    );
});