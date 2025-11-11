import { useGetMonitorQuery } from '@/features/settings/monitor/api/monitorApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import styles from './MonitorPage.module.scss';

export const MonitorPage = () => {
    const { data: pollingStatus } = useGetPollingStatusQuery();
    const pollInterval = pollingStatus?.pollInterval ?? 5000;

    const { data: tags, isLoading, error } = useGetMonitorQuery(undefined, {
        pollingInterval: pollInterval,
    });

    if (isLoading) {
        return (
            <div className={styles['monitorPage']}>
                <div className={styles['monitorPage__header']}>
                    <Skeleton variant="text" width="25%" height={50} />
                </div>
                <div className={styles['monitorPage__content']}>
                    <Skeleton width="100%" height={400} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['monitorPage']}>
                <div className={styles['monitorPage__error']}>
                    Ошибка загрузки тегов
                </div>
            </div>
        );
    }

    const formatValue = (value: number | string | boolean | null): string => {
        if (value === null || value === undefined) {
            return '—';
        }
        if (typeof value === 'boolean') {
            return value ? 'Да' : 'Нет';
        }
        return String(value);
    };

    return (
        <div className={styles['monitorPage']}>
            <div className={styles['monitorPage__header']}>
                <h1 className={styles['monitorPage__title']}>
                    Мониторинг тегов
                </h1>
                {pollingStatus?.isPolling && (
                    <span className={styles['monitorPage__status']}>
                        Опрос активен
                    </span>
                )}
            </div>
            <div className={styles['monitorPage__content']}>
                <div className={styles['monitorPage__tableWrapper']}>
                    <table className={styles['monitorPage__table']}>
                        <thead>
                            <tr>
                                <th>Порт</th>
                                <th>Устройство</th>
                                <th>Название тега</th>
                                <th>Категория</th>
                                <th>Значение</th>
                                <th>Ед. изм.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags && tags.length > 0 ? (
                                tags.map((tag) => (
                                    <tr key={tag._id}>
                                        <td>{tag.portName}</td>
                                        <td>{tag.deviceName}</td>
                                        <td>{tag.tagName}</td>
                                        <td>{tag.category}</td>
                                        <td>{formatValue(tag.value)}</td>
                                        <td>{tag.unit || '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className={styles['monitorPage__empty']}>
                                        Нет тегов
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

