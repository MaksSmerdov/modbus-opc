import { useParams, Navigate } from 'react-router-dom';
import { useGetPortsQuery } from '@/features/settings/port/api/portsApi';
import { transliterate } from '@/shared/utils/transliterate';
import { Loader } from '@/shared/ui/Loader/Loader';
import styles from './PortPage.module.scss';

// Зарезервированные пути
const RESERVED_PATHS = ['admin', 'login', 'register'];

export const PortPage = () => {
    const { portSlug } = useParams<{ portSlug: string }>();
    const { data: ports, isLoading, error } = useGetPortsQuery();

    // Проверяем, не является ли путь зарезервированным
    if (portSlug && RESERVED_PATHS.includes(portSlug)) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div className={styles['portPage']}>
                <Loader size={80} />
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

    const getPortInfo = () => {
        if (port.connectionType === 'RTU') {
            return {
                type: 'RTU',
                details: `COM порт: ${port.port}`,
                config: {
                    'Скорость передачи': `${port.baudRate} бод`,
                    'Биты данных': port.dataBits,
                    'Стоп-биты': port.stopBits,
                    'Четность': port.parity === 'none' ? 'Нет' : port.parity === 'even' ? 'Четная' : 'Нечетная',
                },
            };
        } else {
            return {
                type: 'TCP',
                details: `IP: ${port.host}:${port.tcpPort}`,
                config: {},
            };
        }
    };

    const portInfo = getPortInfo();

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
                    <h2 className={styles['portPage__sectionTitle']}>Тип подключения</h2>
                    <p className={styles['portPage__sectionValue']}>{portInfo.type}</p>
                </div>

                <div className={styles['portPage__section']}>
                    <h2 className={styles['portPage__sectionTitle']}>Подключение</h2>
                    <p className={styles['portPage__sectionValue']}>{portInfo.details}</p>
                </div>

                {Object.keys(portInfo.config).length > 0 && (
                    <div className={styles['portPage__section']}>
                        <h2 className={styles['portPage__sectionTitle']}>Настройки</h2>
                        <div className={styles['portPage__config']}>
                            {Object.entries(portInfo.config).map(([key, value]) => (
                                <div key={key} className={styles['portPage__configItem']}>
                                    <span className={styles['portPage__configKey']}>{key}:</span>
                                    <span className={styles['portPage__configValue']}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles['portPage__section']}>
                    <h2 className={styles['portPage__sectionTitle']}>Дата создания</h2>
                    <p className={styles['portPage__sectionValue']}>
                        {new Date(port.createdAt).toLocaleString('ru-RU')}
                    </p>
                </div>

                {/* Заглушка для будущих девайсов */}
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


