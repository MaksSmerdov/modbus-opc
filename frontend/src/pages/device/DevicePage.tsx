import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useGetDevicesQuery, useUpdateDeviceMutation } from '@/features/settings/device/api/devicesApi';
import { useGetDeviceDataQuery } from '@/features/settings/device/api/deviceDataApi';
import { useGetTagsQuery } from '@/features/settings/tag/api/tagsApi';
import { useGetPollingStatusQuery } from '@/features/polling/api/pollingApi';
import { useAppSelector } from '@/app/hooks/hooks';
import { transliterate } from '@/shared/utils/transliterate';
import { Button } from '@/shared/ui/Button/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import { useThrottle } from '@/shared/hooks/useThrottle';
import { ArrowBack, Code, PowerSettingsNew } from '@mui/icons-material';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { TagsTable, TagsValuesView } from '@/features/settings/tag';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './DevicePage.module.scss';

const RESERVED_PATHS = ['admin', 'login', 'register'];

export const DevicePage = () => {
    const { portSlug, deviceSlug } = useParams<{ portSlug: string; deviceSlug: string }>();
    const navigate = useNavigate();
    const { data: devices, isLoading: devicesLoading, error: devicesError } = useGetDevicesQuery();
    const { user } = useAppSelector((state) => state.auth);
    const { data: pollingStatus } = useGetPollingStatusQuery(undefined, {
        pollingInterval: 2000,
    });
    const { showSuccess, showError } = useSnackbar();
    const [updateDevice] = useUpdateDeviceMutation();

    // Находим устройство заранее для использования в хуке
    const device = devices?.find((d) => transliterate(d.slug || d.name) === deviceSlug);

    // Вызываем хук всегда, но передаем undefined если устройство не найдено
    // RTK Query не выполнит запрос если deviceId undefined
    const { data: tags, isLoading: tagsLoading, error: tagsError } = useGetTagsQuery(device?._id ?? '', {
        skip: !device?._id, // Пропускаем запрос если устройство не найдено
    });

    // Получаем данные устройства, если оно включено и опрос активен
    const isDeviceActive = device?.isActive ?? false;
    const isPollingActive = pollingStatus?.isPolling ?? false;
    const shouldShowValues = isDeviceActive && isPollingActive;

    const { data: deviceData, isLoading: deviceDataLoading } = useGetDeviceDataQuery(
        device?.slug ?? '',
        {
            skip: !shouldShowValues || !device?.slug,
            pollingInterval: shouldShowValues ? 2000 : 0, // Обновляем каждые 2 секунды, если нужно показывать значения
        }
    );

    // Отслеживаем переключение между режимами отображения
    const prevShouldShowValues = useRef(shouldShowValues);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (prevShouldShowValues.current !== shouldShowValues) {
            setIsTransitioning(true);
            prevShouldShowValues.current = shouldShowValues;
        }

        // Сбрасываем состояние перехода когда данные загрузились для текущего режима
        if (shouldShowValues) {
            // Если режим значений, ждем загрузки данных
            if (!deviceDataLoading && deviceData) {
                setIsTransitioning(false);
            }
        } else {
            // Если режим таблицы, сбрасываем сразу (теги уже загружены)
            if (!tagsLoading) {
                setIsTransitioning(false);
            }
        }
    }, [shouldShowValues, deviceDataLoading, deviceData, tagsLoading]);

    const canManageTags = user?.role === 'admin' || user?.role === 'operator';
    const canManageDevices = user?.role === 'admin' || user?.role === 'operator';

    const handleToggleDeviceInternal = useCallback(async () => {
        if (!device || !canManageDevices) return;
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
    }, [device, canManageDevices, updateDevice, showSuccess, showError]);

    const { throttledFn: handleToggleDevice, isLoading: isTogglingDevice } = useThrottle(handleToggleDeviceInternal, 1000);

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
                <div className={styles['devicePage__headerRight']}>
                    {canManageDevices && (
                        <IconButton
                            icon={<PowerSettingsNew fontSize="small" />}
                            tooltip={device.isActive ? 'Выключить устройство' : 'Включить устройство'}
                            variant="power"
                            active={device.isActive}
                            onClick={handleToggleDevice}
                            isLoading={isTogglingDevice}
                        />
                    )}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Code />}
                        onClick={handleOpenApi}
                        disabled={isTogglingDevice}
                    >
                        API JSON
                    </Button>
                </div>
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
                    ) : isTransitioning || (shouldShowValues && deviceDataLoading) ? (
                        <div className={styles['devicePage__loading']}>
                            <Skeleton width="100%" height={200} />
                        </div>
                    ) : shouldShowValues ? (
                        <TagsValuesView
                            tags={tags || []}
                            deviceData={deviceData?.data || null}
                        />
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
