
import { useState, useMemo, useCallback, memo } from 'react';
import { useGetDevicesQuery, useDeleteDeviceMutation, useUpdateDeviceMutation } from '../../api/devicesApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import { DeviceCard } from '../DeviceCard/DeviceCard';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { Device } from '../../types';
import styles from './DevicesList.module.scss';
import deviceCardStyles from '../DeviceCard/DeviceCard.module.scss';
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
    const { showSuccess, showError } = useSnackbar();
    const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();
    const [updateDevice] = useUpdateDeviceMutation();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

    // Получаем portSlug из URL для навигации
    const { portSlug } = useParams<{ portSlug: string }>();

    const isPollingActive = useMemo(() => isPolling, [isPolling]);
    const canManageDevices = useMemo(() => user?.role === 'admin' || user?.role === 'operator', [user?.role]);
    const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

    // Фильтруем устройства по порту
    const portDevices = useMemo(() => 
        devices?.filter((device) => device.portId === portId) || [],
        [devices, portId]
    );

    const handleToggleDeviceActive = useCallback(async (device: Device) => {
        try {
            await updateDevice({
                id: device._id,
                data: { isActive: !device.isActive },
            }).unwrap();
            showSuccess(device.isActive ? 'Устройство выключено' : 'Устройство включено');
        } catch (error) {
            console.error('Ошибка переключения активности устройства:', error);
            showError('Не удалось изменить статус устройства');
        }
    }, [updateDevice, showSuccess, showError]);

    const handleToggleLogData = useCallback(async (device: Device) => {
        try {
            await updateDevice({
                id: device._id,
                data: { logData: !device.logData },
            }).unwrap();
            showSuccess(device.logData ? `Логи объекта '${device.name}' выключены` : `Логи объекта '${device.name}' включены`);
        } catch (error) {
            console.error('Ошибка переключения логирования данных:', error);
            showError('Не удалось изменить настройку логирования');
        }
    }, [updateDevice, showSuccess, showError]);

    const handleDeleteClick = useCallback((deviceId: string) => {
        setDeviceToDelete(deviceId);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deviceToDelete) return;
        try {
            await deleteDevice(deviceToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setDeviceToDelete(null);
            showSuccess('Устройство успешно удалено');
        } catch (error) {
            console.error('Ошибка удаления устройства:', error);
            showError('Не удалось удалить устройство');
        }
    }, [deviceToDelete, deleteDevice, showSuccess, showError]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmOpen(false);
        setDeviceToDelete(null);
    }, []);

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

    const handleToggleLog = useCallback((device: Device) => {
        if (isAdmin) {
            handleToggleLogData(device);
        }
    }, [isAdmin, handleToggleLogData]);

    if (isLoading) {
        return (
            <div className={deviceCardStyles['deviceCard']}>
                <div className={deviceCardStyles['deviceCard__header']}>
                    <div className={deviceCardStyles['deviceCard__title']}>
                        <Skeleton variant="text" width="60%" height={24} className={deviceCardStyles['deviceCard__name']} />
                        <div className={deviceCardStyles['deviceCard__actions']}>
                            <Skeleton variant="circular" width={24} height={24} />
                        </div>
                    </div>
                </div>
                <Skeleton variant="text" width="20%" height={24} className={deviceCardStyles['deviceCard__name']} />
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
            <div className={styles['devicesList']}>
                {portDevices.map((device) => {
                    const handleEdit = canManageDevices && onEdit ? () => handleEditDevice(device) : undefined;
                    const handleDelete = canManageDevices ? () => handleDeleteDevice(device._id) : undefined;
                    const handleToggle = canManageDevices ? () => handleToggleActive(device) : undefined;
                    const handleLog = isAdmin ? () => handleToggleLog(device) : undefined;
                    
                    return (
                        <DeviceCard
                            key={device._id}
                            device={device}
                            portSlug={portSlug}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggle}
                            onToggleLogData={handleLog}
                            isPollingActive={isPollingActive}
                        />
                    );
                })}
            </div>
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