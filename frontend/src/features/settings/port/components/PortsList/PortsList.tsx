import { useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { useGetPortsQuery } from '../../api/portsApi';
import { useGetDevicesQuery } from '@/features/settings/device/api/devicesApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { PortCard } from '../PortCard/PortCard';
import { PortCardSkeleton } from '../PortCard/PortCardSkeleton';
import { ConfirmModal } from '@/shared/ui/ConfirmModal/ConfirmModal';
import { usePortDeletion } from '../../hooks/usePortDeletion';
import { usePortToggle } from '../../hooks/usePortToggle';
import { countDevicesByPort } from '../../utils/portUtils';
import type { Port } from '../../types';
import styles from './PortsList.module.scss';

interface PortsListProps {
    onEdit?: (port: Port) => void;
}

export const PortsList = memo(({ onEdit }: PortsListProps) => {
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

    const {
        deleteConfirmOpen,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
    } = usePortDeletion();

    const { handleTogglePortActive } = usePortToggle();

    const isPollingActive = useMemo(() => isPolling, [isPolling]);
    const canManagePorts = useMemo(() => user?.role === 'admin' || user?.role === 'operator', [user?.role]);

    // Подсчитываем количество устройств для каждого порта
    const devicesCountByPort = useMemo(
        () => countDevicesByPort(ports, devices),
        [devices, ports]
    );

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
                    <PortCardSkeleton key={index} />
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
                    Нет портов
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

