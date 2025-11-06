import { useGetPortsQuery, useDeletePortMutation } from '../../api/portsApi';
import { PortCard } from '../PortCard/PortCard';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import styles from './PortsList.module.scss';
import portCardStyles from '../PortCard/PortCard.module.scss';

interface PortsListProps {
    isCollapsed?: boolean;
    onEdit?: (portId: string) => void;
}

export const PortsList = ({ isCollapsed = false, onEdit }: PortsListProps) => {
    const { data: ports, isLoading, error } = useGetPortsQuery();
    const [deletePort] = useDeletePortMutation();

    const handleDelete = async (portId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот порт?')) {
            try {
                await deletePort(portId).unwrap();
            } catch (error) {
                console.error('Ошибка удаления порта:', error);
                alert('Не удалось удалить порт');
            }
        }
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
        <div className={styles['portsList']}>
            {ports.map((port) => (
                <PortCard
                    key={port._id}
                    port={port}
                    onEdit={onEdit ? () => onEdit(port._id) : undefined}
                    onDelete={handleDelete}
                    isCollapsed={isCollapsed}
                />
            ))}
        </div>
    );
};

