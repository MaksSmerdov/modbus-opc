import { useParams, Navigate } from 'react-router-dom';
import { useGetPortsQuery } from '@/features/settings/port/api/portsApi';
import { transliterate } from '@/shared/utils/transliterate';
import styles from './PortPage.module.scss';
import {Skeleton} from "@/shared/ui/Skeleton/Skeleton.tsx";

const RESERVED_PATHS = ['admin', 'login', 'register'];

export const PortPage = () => {
    const { portSlug } = useParams<{ portSlug: string }>();
    const { data: ports, isLoading, error } = useGetPortsQuery();

    if (portSlug && RESERVED_PATHS.includes(portSlug)) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div className={styles['portPage']}>
                <div className={styles['portPage__header']}>
                    <Skeleton  variant={"text"} width='25%' height={50} />
                    <div className={styles['portPage__status']}>
                        <Skeleton variant={'circular'} width={50} height={36} />
                    </div>
                </div>
                <div className={styles['portPage__content']}>
                    <div className={styles['portPage__section']}>
                        <Skeleton width='75%' height={120} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !ports) {
        return (
            <div className={styles['portPage']}>
                <div className={styles['portPage__error']}>
                    Ошибка загрузки порта
                </div>

            </div>
        );
    }

    // Находим порт по slug (транслитерированному названию)
    const port = ports.find((p) => transliterate(p.name) === portSlug);

    if (!port) {
        return <Navigate to="/" replace />;
    }


    return (
        <div className={styles['portPage']}>
            <div className={styles['portPage__header']}>
                <h1 className={styles['portPage__title']}>{port.name}</h1>
                <div className={styles['portPage__status']}>
                    <span className={`${styles['portPage__statusBadge']} ${port.isActive ? styles['portPage__statusBadge_active'] : ''}`}>
                        {port.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                </div>
            </div>

            <div className={styles['portPage__content']}>
                <div className={styles['portPage__section']}>
                    <h2 className={styles['portPage__sectionTitle']}>Устройства</h2>
                    <p className={styles['portPage__sectionValue']} style={{ color: 'var(--text-secondary-light)' }}>
                        Список устройств будет здесь
                    </p>
                </div>
            </div>
        </div>
    );
};


