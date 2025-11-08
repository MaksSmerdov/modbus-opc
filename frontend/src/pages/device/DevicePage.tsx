import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useGetDevicesQuery } from '@/features/settings/device/api/devicesApi';
import { useGetTagsQuery } from '@/features/settings/tag/api/tagsApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { transliterate } from '@/shared/utils/transliterate';
import { Button } from '@/shared/ui/Button/Button';
import { ArrowBack, Code } from '@mui/icons-material';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { TagsTable } from '@/features/settings/tag';
import styles from './DevicePage.module.scss';

const RESERVED_PATHS = ['admin', 'login', 'register'];

export const DevicePage = () => {
    const { portSlug, deviceSlug } = useParams<{ portSlug: string; deviceSlug: string }>();
    const navigate = useNavigate();
    const { data: devices, isLoading: devicesLoading, error: devicesError } = useGetDevicesQuery();
    const { user } = useAppSelector((state) => state.auth);

    // Находим устройство заранее для использования в хуке
    const device = devices?.find((d) => transliterate(d.slug || d.name) === deviceSlug);

    // Вызываем хук всегда, но передаем undefined если устройство не найдено
    // RTK Query не выполнит запрос если deviceId undefined
    const { data: tags, isLoading: tagsLoading, error: tagsError } = useGetTagsQuery(device?._id ?? '', {
        skip: !device?._id, // Пропускаем запрос если устройство не найдено
    });

    const canManageTags = user?.role === 'admin' || user?.role === 'operator';

    if (portSlug && RESERVED_PATHS.includes(portSlug)) {
        return <Navigate to="/" replace />;
    }

    if (devicesLoading) {
        return (
            <div className={styles['devicePage']}>
                <div className={styles['devicePage__header']}>
                    <Skeleton variant="text" width="25%" height={50} />
                </div>
                <div className={styles['devicePage__content']}>
                    <Skeleton width="100%" height={200} />
                </div>
            </div>
        );
    }

    if (devicesError || !devices) {
        return (
            <div className={styles['devicePage']}>
                <div className={styles['devicePage__error']}>
                    Ошибка загрузки устройства
                </div>
            </div>
        );
    }

    if (!device) {
        return <Navigate to={portSlug ? `/${portSlug}` : '/'} replace />;
    }

    const handleBack = () => {
        if (portSlug) {
            navigate(`/${portSlug}`);
        } else {
            navigate('/');
        }
    };

    const handleOpenApi = () => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const apiUrl = `${baseUrl}/data/devices/${device.slug || transliterate(device.name)}`;
        window.open(apiUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={styles['devicePage']}>
            <div className={styles['devicePage__header']}>
                <div className={styles['devicePage__headerLeft']}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                    >
                        Назад
                    </Button>
                    <h1 className={styles['devicePage__title']}>{device.name}</h1>

                </div>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Code />}
                    onClick={handleOpenApi}
                >
                    API JSON
                </Button>
            </div>

            <div className={styles['devicePage__content']}>
                <div className={styles['devicePage__section']}>
                    <div className={styles['devicePage__sectionHeader']}>
                        <h2 className={styles['devicePage__sectionTitle']}>Тэги</h2>
                    </div>

                    {tagsLoading ? (
                        <div className={styles['devicePage__loading']}>
                            <Skeleton width="100%" height={200} />
                        </div>
                    ) : tagsError ? (
                        <div className={styles['devicePage__error']}>
                            Ошибка загрузки тэгов
                        </div>
                    ) : (
                        <TagsTable
                            deviceId={device._id}
                            tags={tags || []}
                            canEdit={canManageTags}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
