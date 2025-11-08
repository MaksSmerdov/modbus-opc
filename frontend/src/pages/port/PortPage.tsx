import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGetPortsQuery } from '@/features/settings/port/api/portsApi';
import { useCreateDeviceMutation, useUpdateDeviceMutation } from '@/features/settings/device/api/devicesApi';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import { useAppSelector } from '@/app/hooks/hooks';
import { transliterate } from '@/shared/utils/transliterate';
import { DevicesList, AddDeviceForm } from '@/features/settings/device';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { Add as AddIcon } from '@mui/icons-material';
import type { Device, CreateDeviceData } from '@/features/settings/device/types';
import styles from './PortPage.module.scss';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

const RESERVED_PATHS = ['admin', 'login', 'register'];

export const PortPage = () => {
    const { portSlug } = useParams<{ portSlug: string }>();
    const { data: ports, isLoading, error } = useGetPortsQuery();
    const { user } = useAppSelector((state) => state.auth);
    const { showSuccess, showError } = useSnackbar();
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [createDevice, { isLoading: isCreating }] = useCreateDeviceMutation();
    const [updateDevice, { isLoading: isUpdating }] = useUpdateDeviceMutation();

    const canManageDevices = user?.role === 'admin' || user?.role === 'operator';

    if (portSlug && RESERVED_PATHS.includes(portSlug)) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div className={styles['portPage']}>
                <div className={styles['portPage__header']}>
                    <Skeleton variant={"text"} width='25%' height={50} />
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

    const port = ports.find((p) => transliterate(p.name) === portSlug);

    if (!port) {
        return <Navigate to="/" replace />;
    }

    const handleAddDevice = async (deviceData: CreateDeviceData) => {
        try {
            await createDevice({ ...deviceData, portId: port._id }).unwrap();
            setIsDeviceModalOpen(false);
            setEditingDevice(null);
            showSuccess('Устройство успешно создано');
        } catch (error) {
            console.error('Ошибка создания устройства:', error);
            showError('Не удалось создать устройство');
        }
    };

    const handleEditDevice = (device: Device) => {
        setEditingDevice(device);
        setIsDeviceModalOpen(true);
    };

    const handleUpdateDevice = async (deviceData: CreateDeviceData) => {
        if (!editingDevice) return;
        try {
            await updateDevice({ id: editingDevice._id, data: deviceData }).unwrap();
            setIsDeviceModalOpen(false);
            setEditingDevice(null);
            showSuccess('Устройство успешно обновлено');
        } catch (error) {
            console.error('Ошибка обновления устройства:', error);
            showError('Не удалось обновить устройство');
        }
    };

    const handleModalClose = () => {
        setIsDeviceModalOpen(false);
        setEditingDevice(null);
    };

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
                    <div className={styles['portPage__sectionHeader']}>
                        <h2 className={styles['portPage__sectionTitle']}>Устройства</h2>
                        {canManageDevices && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setEditingDevice(null);
                                    setIsDeviceModalOpen(true);
                                }}
                            >
                                Добавить устройство
                            </Button>
                        )}
                    </div>
                    <DevicesList portId={port._id} onEdit={canManageDevices ? handleEditDevice : undefined} />
                </div>
            </div>

            <Modal
                open={isDeviceModalOpen}
                onClose={handleModalClose}
                title={editingDevice ? 'Редактировать устройство' : 'Добавить устройство'}
                maxWidth="sm"
                fullWidth
            >
                <AddDeviceForm
                    onSubmit={editingDevice ? handleUpdateDevice : handleAddDevice}
                    onCancel={handleModalClose}
                    isLoading={isCreating || isUpdating}
                    portId={port._id}
                    initialData={editingDevice || undefined}
                    mode={editingDevice ? 'edit' : 'create'}
                />
            </Modal>
        </div>
    );
};


