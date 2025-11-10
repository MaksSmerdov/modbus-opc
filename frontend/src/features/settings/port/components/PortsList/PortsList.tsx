import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { useGetPortsQuery, useDeletePortMutation, useUpdatePortMutation } from '../../api/portsApi';
import { useGetDevicesQuery } from '@/features/settings/device/api/devicesApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import { PortCard } from '../PortCard/PortCard';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import type { Port } from '../../types';
import styles from './PortsList.module.scss';
import portCardStyles from '../PortCard/PortCard.module.scss';

interface PortsListProps {
    isCollapsed?: boolean;
    onEdit?: (port: Port) => void;
}

export const PortsList = memo(({ isCollapsed = false, onEdit }: PortsListProps) => {
    const { data: ports, isLoading, error } = useGetPortsQuery();
    const { data: devices } = useGetDevicesQuery();
    // Сохраняем предыдущее количество портов для отображения скелетонов
    const previousPortsCountRef = useRef<number>(3);
    const { isPolling } = useGetPollingStatusQuery(undefined, {
        selectFromResult: ({ data }) => ({
            isPolling: data?.isPolling ?? false,
        }),
    });
    const { user } = useAppSelector((state) => state.auth);
    const { showSuccess, showError } = useSnackbar();
    const [deletePort, { isLoading: isDeleting }] = useDeletePortMutation();
    const [updatePort] = useUpdatePortMutation();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [portToDelete, setPortToDelete] = useState<string | null>(null);

    const isPollingActive = useMemo(() => isPolling, [isPolling]);
    const canManagePorts = useMemo(() => user?.role === 'admin' || user?.role === 'operator', [user?.role]);

    // Подсчитываем количество устройств для каждого порта
    const devicesCountByPort = useMemo(() => {
        if (!devices || !ports) return {};
        const countMap: Record<string, number> = {};
        ports.forEach((port) => {
            countMap[port._id] = devices.filter((device) => device.portId === port._id).length;
        });
        return countMap;
    }, [devices, ports]);

    const handleTogglePortActive = useCallback(async (port: Port) => {
        try {
            await updatePort({
                id: port._id,
                data: { isActive: !port.isActive },
            }).unwrap();
            showSuccess(port.isActive ? 'Порт выключен' : 'Порт включен');
        } catch (error) {
            console.error('Ошибка переключения активности порта:', error);
            showError('Не удалось изменить статус порта');
        }
    }, [updatePort, showSuccess, showError]);

    const handleDeleteClick = useCallback((portId: string) => {
        setPortToDelete(portId);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!portToDelete) return;
        try {
            await deletePort(portToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setPortToDelete(null);
            showSuccess('Порт успешно удален');
        } catch (error) {
            console.error('Ошибка удаления порта:', error);
            showError('Не удалось удалить порт');
        }
    }, [portToDelete, deletePort, showSuccess, showError]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmOpen(false);
        setPortToDelete(null);
    }, []);

    // Мемоизировать обработчики для map
    const handleEditPort = useCallback((port: Port) => {
        if (canManagePorts && onEdit) {
            onEdit(port);
        }
    }, [canManagePorts, onEdit]);

    const handleDeletePort = useCallback((portId: string) => {
        if (canManagePorts) {
            handleDeleteClick(portId);
        }
    }, [canManagePorts, handleDeleteClick]);

    const handleToggleActive = useCallback((port: Port) => {
        if (canManagePorts) {
            handleTogglePortActive(port);
        }
    }, [canManagePorts, handleTogglePortActive]);

    // Обновляем количество портов при изменении данных
    useEffect(() => {
        if (ports && ports.length > 0) {
            previousPortsCountRef.current = ports.length;
        }
    }, [ports]);

    // Определяем количество скелетонов для отображения
    const skeletonsCount = previousPortsCountRef.current;

    if (isLoading) {
        return (
            <div className={styles['portsList']}>
                {Array.from({ length: skeletonsCount }).map((_, index) => (
                    <div key={index} className={portCardStyles['portCard']}>
                        <div className={portCardStyles['portCard__header']}>
                            <div className={portCardStyles['portCard__title']}>
                                <Skeleton variant="text" width="60%" height={24} className={portCardStyles['portCard__name']} />
                                <div className={portCardStyles['portCard__actions']}>
                                    <Skeleton variant="circular" width={24} height={24} />
                                </div>
                            </div>
                        </div>
                        <Skeleton variant="text" width="20%" height={24} className={portCardStyles['portCard__name']} />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['portsList']}>
                <div className={styles['portsList__error']}>
                    Ошибка загрузки портов
                </div>
            </div>
        );
    }

    if (!ports || ports.length === 0) {
        return (
            <div className={styles['portsList']}>
                <div className={styles['portsList__empty']}>
                    {isCollapsed ? '' : 'Нет портов'}
                </div>
            </div>
        );
    }

    return (
        <>
            <ul className={`${styles['portsList']} list-reset`}>
                {ports.map((port) => (
                    <PortCard
                        key={port._id}
                        port={port}
                        devicesCount={devicesCountByPort[port._id] ?? 0}
                        onEdit={canManagePorts && onEdit ? handleEditPort : undefined}
                        onDelete={canManagePorts ? handleDeletePort : undefined}
                        onToggleActive={canManagePorts ? handleToggleActive : undefined}
                        isPollingActive={isPollingActive}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </ul>
            <ConfirmModal
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Удаление порта"
                message="Вы уверены, что хотите удалить этот порт? Это действие нельзя отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                confirmVariant="contained"
                isLoading={isDeleting}
            />
        </>
    );
});

