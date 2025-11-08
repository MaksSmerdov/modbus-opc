import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useGetDevicesQuery } from '@/features/settings/device/api/devicesApi';
import { useGetTagsQuery } from '@/features/settings/tag/api/tagsApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { transliterate } from '@/shared/utils/transliterate';
import { Button } from '@/shared/ui/Button/Button';
import { Add as AddIcon, ArrowBack } from '@mui/icons-material';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import styles from './DevicePage.module.scss';

const RESERVED_PATHS = ['admin', 'login', 'register'];

export const DevicePage = () => {
    const { portSlug, deviceSlug } = useParams<{ portSlug: string; deviceSlug: string }>();
    const navigate = useNavigate();
    const { data: devices, isLoading: devicesLoading, error: devicesError } = useGetDevicesQuery();
    const { user } = useAppSelector((state) => state.auth);

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

    const device = devices.find((d) => transliterate(d.slug || d.name) === deviceSlug);

    if (!device) {
        return <Navigate to={portSlug ? `/${portSlug}` : '/'} replace />;
    }

    const { data: tags, isLoading: tagsLoading, error: tagsError } = useGetTagsQuery(device._id);

    const handleBack = () => {
        if (portSlug) {
            navigate(`/${portSlug}`);
        } else {
            navigate('/');
        }
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
                {canManageTags && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            // TODO: Открыть модальное окно для добавления тэга
                        }}
                    >
                        Добавить тэг
                    </Button>
                )}
            </div>

            <div className={styles['devicePage__content']}>
                <div className={styles['devicePage__section']}>
                    <div className={styles['devicePage__sectionHeader']}>
                        <h2 className={styles['devicePage__sectionTitle']}>Тэги</h2>
                    </div>

                    {tagsLoading ? (
                        <div className={styles['devicePage__loading']}>
                            <Skeleton width="100%" height={60} />
                            <Skeleton width="100%" height={60} />
                            <Skeleton width="100%" height={60} />
                        </div>
                    ) : tagsError ? (
                        <div className={styles['devicePage__error']}>
                            Ошибка загрузки тэгов
                        </div>
                    ) : !tags || tags.length === 0 ? (
                        <div className={styles['devicePage__empty']}>
                            Нет тэгов для этого устройства
                        </div>
                    ) : (
                        <div className={styles['devicePage__tagsList']}>
                            {tags.map((tag) => (
                                <div key={tag._id} className={styles['devicePage__tag']}>
                                    <div className={styles['devicePage__tagHeader']}>
                                        <h4 className={styles['devicePage__tagName']}>{tag.name}</h4>
                                    </div>
                                    <div className={styles['devicePage__tagInfo']}>
                                        <span className={styles['devicePage__tagInfoItem']}>
                                            Адрес: {tag.address}
                                        </span>
                                        <span className={styles['devicePage__tagInfoItem']}>
                                            Тип: {tag.dataType}
                                        </span>
                                        {tag.unit && (
                                            <span className={styles['devicePage__tagInfoItem']}>
                                                Ед. изм.: {tag.unit}
                                            </span>
                                        )}
                                    </div>
                                    {tag.description && (
                                        <div className={styles['devicePage__tagDescription']}>
                                            {tag.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
