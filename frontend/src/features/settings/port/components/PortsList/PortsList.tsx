import { useState } from 'react';
import { useGetPortsQuery, useDeletePortMutation, useUpdatePortMutation } from '../../api/portsApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { useAppSelector } from '@/app/hooks/hooks';
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

export const PortsList = ({ isCollapsed = false, onEdit }: PortsListProps) => {
    const { data: ports, isLoading, error } = useGetPortsQuery();
    const { data: pollingStatus } = useGetPollingStatusQuery();
    const { user } = useAppSelector((state) => state.auth);
    const [deletePort, { isLoading: isDeleting }] = useDeletePortMutation();
    const [updatePort] = useUpdatePortMutation();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [portToDelete, setPortToDelete] = useState<string | null>(null);

    const isPollingActive = pollingStatus?.isPolling ?? false;
    const canManagePorts = user?.role === 'admin' || user?.role === 'operator';

    const handleTogglePortActive = async (port: Port) => {
        try {
            await updatePort({
                id: port._id,
                data: { isActive: !port.isActive },
            }).unwrap();
        } catch (error) {
            console.error('Ошибка переключения активности порта:', error);
            alert('Не удалось изменить статус порта');
        }
    };

    const handleDeleteClick = (portId: string) => {
        setPortToDelete(portId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!portToDelete) return;
        try {
            await deletePort(portToDelete).unwrap();
            setDeleteConfirmOpen(false);
            setPortToDelete(null);
        } catch (error) {
            console.error('Ошибка удаления порта:', error);
            alert('Не удалось удалить порт');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setPortToDelete(null);
    };

    if (isLoading) {
        return (
            <div className={portCardStyles['portCard']}>
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
            <div className={styles['portsList']}>
                {ports.map((port) => (
                    <PortCard
                        key={port._id}
                        port={port}
                        onEdit={canManagePorts && onEdit ? () => onEdit(port) : undefined}
                        onDelete={canManagePorts ? handleDeleteClick : undefined}
                        onToggleActive={canManagePorts ? handleTogglePortActive : undefined}
                        isPollingActive={isPollingActive}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>
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
};

