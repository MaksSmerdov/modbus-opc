import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGetPortsQuery } from '@/features/settings/port/api/portsApi';
import { useCreateDeviceMutation, useUpdateDeviceMutation } from '@/features/settings/device/api/devicesApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { useAppSelector } from '@/app/hooks/hooks';
import { transliterate } from '@/shared/utils/transliterate';
import { DevicesList, AddDeviceForm } from '@/features/settings/device';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { Add as AddIcon } from '@mui/icons-material';
import type { Device, CreateDeviceData } from '@/features/settings/device/types';
import styles from './PortPage.module.scss';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { PageHeader } from '@/shared/layout/PageHeader/PageHeader';

const RESERVED_PATHS = ['admin', 'login', 'register'];

export const PortPage = () => {
    const { portSlug } = useParams<{ portSlug: string }>();
    const { data: ports, isLoading, error } = useGetPortsQuery();
    const { user } = useAppSelector((state) => state.auth);
    const { showSuccess, showError } = useSnackbar();
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
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
            const errorMessage = getErrorMessage(error, 'Не удалось создать устройство');
            showError(errorMessage);
        }
    };

    const handleEditDevice = (device: Device) => {
        setEditingDevice(device);
        setModalMode('edit');
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
            const errorMessage = getErrorMessage(error, 'Не удалось обновить устройство');
            showError(errorMessage);
        }
    };

    const handleModalClose = () => {
        setIsDeviceModalOpen(false);
        // Не сбрасываем editingDevice и modalMode здесь
    };

    const handleModalExited = () => {
        // Сбрасываем состояние только после полного закрытия модалки
        setEditingDevice(null);
        setModalMode('create');
    };

    return (
        <div className={`${styles['portPage']} page`}>
            <PageHeader
                title={port.name}
                status={port.isActive ? 'Активен' : 'Неактивен'}
                isActive={port.isActive}
            />

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
                                    setModalMode('create');
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
                onExited={handleModalExited}
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
                    mode={modalMode}
                />
            </Modal>
        </div>
    );
};


