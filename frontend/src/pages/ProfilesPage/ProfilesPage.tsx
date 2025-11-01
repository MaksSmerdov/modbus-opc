import { useParams, useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { Modal, Button } from '@/shared/components';
import { useModal } from '@/shared/hooks/useModal';
import { PortForm, DeviceForm } from '@/features/config/components';
import { 
  useGetPortsQuery, 
  useCreatePortMutation,
  useUpdatePortMutation,
  useDeletePortMutation,
  useGetDevicesQuery,
  useCreateDeviceMutation,
  // TODO: добавить функциональность редактирования и удаления устройств
  // useUpdateDeviceMutation,
  // useDeleteDeviceMutation
} from '@/features/config/api';
import type { 
  CreatePortDto, 
  Port,
  CreateDeviceDto,
  DevicePopulated
} from '@/features/config/types/config.types';
import type { Profile } from '@/shared/layout/Sidebar/Sidebar';
import styles from './ProfilesPage.module.scss';

export const ProfilesPage = () => {
  const { profileId } = useParams<{ profileId?: string }>();
  const navigate = useNavigate();
  const portFormModal = useModal();
  const deviceFormModal = useModal();
  const deletePortModal = useModal();

  // API hooks - Ports
  const { data: portsResponse, isLoading } = useGetPortsQuery();
  const [createPort, { isLoading: isCreatingPort }] = useCreatePortMutation();
  const [updatePort, { isLoading: isUpdatingPort }] = useUpdatePortMutation();
  const [deletePort, { isLoading: isDeletingPort }] = useDeletePortMutation();

  // API hooks - Devices
  const { data: devicesResponse, isLoading: isLoadingDevices } = useGetDevicesQuery();
  const [createDevice, { isLoading: isCreatingDevice }] = useCreateDeviceMutation();
  // TODO: добавить функциональность редактирования и удаления устройств
  // const [updateDevice] = useUpdateDeviceMutation();
  // const [deleteDevice] = useDeleteDeviceMutation();

  // Данные портов
  const ports = portsResponse?.data || [];
  const selectedPort = profileId
    ? ports.find((p: Port) => p._id === profileId)
    : null;

  // Данные устройств - фильтруем по выбранному порту
  const allDevices = devicesResponse?.data || [];
  const portDevices = profileId
    ? allDevices.filter((d: DevicePopulated) => d.portId._id === profileId)
    : [];

  // Editing state из query params
  const searchParams = new URLSearchParams(window.location.search);
  const editingPortId = searchParams.get('editProfile');
  const newDevice = searchParams.get('newDevice');
  const editingPort = editingPortId
    ? ports.find((p: Port) => p._id === editingPortId)
    : null;

  // Port Handlers
  const handleAddProfile = () => {
    navigate('?newProfile=true');
    portFormModal.open();
  };

  const handleEditProfile = (id: string) => {
    navigate(`?editProfile=${id}`);
    portFormModal.open();
  };

  const handleDeleteProfile = (id: string) => {
    navigate(`?deleteProfile=${id}`);
    deletePortModal.open();
  };

  const confirmDeleteProfile = async () => {
    if (!editingPortId) return;
    
    try {
      await deletePort(editingPortId).unwrap();
      deletePortModal.close();
      navigate('/profiles');
      console.log('Порт успешно удален');
    } catch (error) {
      console.error('Ошибка удаления порта:', error);
    }
  };

  const handleProfileSubmit = async (data: CreatePortDto) => {
    try {
      if (editingPortId) {
        await updatePort({ id: editingPortId, data }).unwrap();
        console.log('Порт успешно обновлен');
        portFormModal.close();
        navigate(`/profiles/${editingPortId}`);
      } else {
        const result = await createPort(data).unwrap();
        console.log('Порт успешно создан');
        portFormModal.close();
        if (result.data?._id) {
          navigate(`/profiles/${result.data._id}`);
        } else {
          navigate('/profiles');
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения порта:', error);
    }
  };

  const handleProfileSelect = (id: string) => {
    navigate(`/profiles/${id}`);
  };

  // Device Handlers
  const handleAddDevice = () => {
    if (!profileId) return;
    navigate(`?newDevice=true`);
    deviceFormModal.open();
  };

  const handleDeviceSubmit = async (data: CreateDeviceDto) => {
    try {
      await createDevice(data).unwrap();
      console.log('Устройство успешно создано');
      deviceFormModal.close();
      navigate(`/profiles/${profileId}`);
    } catch (error) {
      console.error('Ошибка создания устройства:', error);
    }
  };

  const handleCloseProfileModal = () => {
    portFormModal.close();
    if (profileId) {
      navigate(`/profiles/${profileId}`);
    } else {
      navigate('/profiles');
    }
  };

  const handleCloseDeviceModal = () => {
    deviceFormModal.close();
    navigate(`/profiles/${profileId}`);
  };

  const handleCloseDeleteModal = () => {
    deletePortModal.close();
    if (profileId) {
      navigate(`/profiles/${profileId}`);
    } else {
      navigate('/profiles');
    }
  };

  // Данные для Sidebar
  const sidebarProfiles: Profile[] = ports.map((port: Port) => ({
    id: port._id,
    name: port.name,
    connectionType: port.connectionType,
    isActive: true,
  }));

  // Открываем модалки при наличии query параметров
  const isNewProfile = searchParams.get('newProfile') === 'true';
  const isDeleteMode = searchParams.get('deleteProfile');
  
  if (isNewProfile && !portFormModal.isOpen) {
    portFormModal.open();
  } else if (!isNewProfile && !editingPortId && portFormModal.isOpen) {
    portFormModal.close();
  }

  if (newDevice === 'true' && !deviceFormModal.isOpen) {
    deviceFormModal.open();
  } else if (newDevice !== 'true' && deviceFormModal.isOpen) {
    deviceFormModal.close();
  }

  if (isDeleteMode && !deletePortModal.isOpen) {
    deletePortModal.open();
  } else if (!isDeleteMode && deletePortModal.isOpen) {
    deletePortModal.close();
  }

  return {
    content: (
      <>
        <div className={styles['profiles-page']}>
          {isLoading ? (
            <div className={styles['profiles-page__loading']}>
              <p>Загрузка портов...</p>
            </div>
          ) : selectedPort ? (
            <div className={styles['profiles-page__content']}>
              {/* Список устройств */}
              <div className={styles['profiles-page__section']}>
                <div className={styles['profiles-page__section-header']}>
                  <h2>Устройства</h2>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddDevice}
                  >
                    <MdAdd size={18} />
                    Добавить устройство
                  </Button>
                </div>

                {isLoadingDevices ? (
                  <p>Загрузка устройств...</p>
                ) : portDevices.length === 0 ? (
                  <div className={styles['profiles-page__empty-devices']}>
                    <p>Нет устройств</p>
                    <p>Добавьте первое устройство для этого порта</p>
                  </div>
                ) : (
                  <div className={styles['profiles-page__devices']}>
                    {portDevices.map((device: DevicePopulated) => (
                      <div key={device._id} className={styles['profiles-page__device-card']}>
                        <div className={styles['profiles-page__device-header']}>
                          <h3>{device.name}</h3>
                          <span className={`${styles['profiles-page__device-status']} ${
                            device.isActive ? styles['profiles-page__device-status--active'] : ''
                          }`}>
                            {device.isActive ? 'Активно' : 'Неактивно'}
                          </span>
                        </div>
                        <div className={styles['profiles-page__device-info']}>
                          <span>Slave ID: {device.slaveId}</span>
                          <span>Тэгов: {device.tags?.length || 0}</span>
                          <span>Интервал: {device.saveInterval} мс</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles['profiles-page__empty']}>
              <h2>Выберите порт</h2>
              <p>Выберите порт из списка слева или создайте новый</p>
            </div>
          )}
        </div>

        {/* Модалка создания/редактирования порта */}
        <Modal
          isOpen={portFormModal.isOpen}
          onClose={handleCloseProfileModal}
          title={editingPortId ? 'Редактирование порта' : 'Создание порта'}
          size="lg"
        >
          <PortForm
            initialData={editingPort || undefined}
            onSubmit={handleProfileSubmit}
            onCancel={handleCloseProfileModal}
            loading={isCreatingPort || isUpdatingPort}
          />
        </Modal>

        {/* Модалка создания устройства */}
        <Modal
          isOpen={deviceFormModal.isOpen}
          onClose={handleCloseDeviceModal}
          title="Добавление устройства"
          size="md"
        >
          {profileId && (
            <DeviceForm
              portId={profileId}
              onSubmit={handleDeviceSubmit}
              onCancel={handleCloseDeviceModal}
              loading={isCreatingDevice}
            />
          )}
        </Modal>

        {/* Модалка подтверждения удаления порта */}
        <Modal
          isOpen={deletePortModal.isOpen}
          onClose={handleCloseDeleteModal}
          title="Удаление порта"
          size="sm"
        >
          <div className={styles['profiles-page__delete-modal']}>
            <p>
              Вы уверены, что хотите удалить порт{' '}
              <strong>{editingPort?.name}</strong>?
            </p>
            <p className={styles['profiles-page__delete-warning']}>
              Это действие нельзя отменить.
            </p>
            <div className={styles['profiles-page__delete-actions']}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseDeleteModal}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmDeleteProfile}
                loading={isDeletingPort}
              >
                Удалить
              </Button>
            </div>
          </div>
        </Modal>
      </>
    ),
    sidebarProps: {
      profiles: sidebarProfiles,
      selectedProfileId: profileId || null,
      onProfileSelect: handleProfileSelect,
      onAddProfile: handleAddProfile,
      onEditProfile: handleEditProfile,
      onDeleteProfile: handleDeleteProfile,
    },
  };
};
