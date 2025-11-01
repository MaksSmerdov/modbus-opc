import { useParams, useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { Modal, Button } from '@/shared/components';
import { useModal } from '@/shared/hooks/useModal';
import { ProfileForm, DeviceForm } from '@/features/config/components';
import { 
  useGetProfilesQuery, 
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useGetDevicesQuery,
  useCreateDeviceMutation,
  // TODO: добавить функциональность редактирования и удаления устройств
  // useUpdateDeviceMutation,
  // useDeleteDeviceMutation
} from '@/features/config/api';
import type { 
  CreateConnectionProfileDto, 
  ConnectionProfile,
  CreateDeviceDto,
  DevicePopulated
} from '@/features/config/types/config.types';
import type { Profile } from '@/shared/layout/Sidebar/Sidebar';
import styles from './ProfilesPage.module.scss';

export const ProfilesPage = () => {
  const { profileId } = useParams<{ profileId?: string }>();
  const navigate = useNavigate();
  const profileFormModal = useModal();
  const deviceFormModal = useModal();
  const deleteProfileModal = useModal();

  // API hooks - Profiles
  const { data: profilesResponse, isLoading } = useGetProfilesQuery();
  const [createProfile, { isLoading: isCreatingProfile }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [deleteProfile, { isLoading: isDeletingProfile }] = useDeleteProfileMutation();

  // API hooks - Devices
  const { data: devicesResponse, isLoading: isLoadingDevices } = useGetDevicesQuery();
  const [createDevice, { isLoading: isCreatingDevice }] = useCreateDeviceMutation();
  // TODO: добавить функциональность редактирования и удаления устройств
  // const [updateDevice] = useUpdateDeviceMutation();
  // const [deleteDevice] = useDeleteDeviceMutation();

  // Данные профилей
  const profiles = profilesResponse?.data || [];
  const selectedProfile = profileId
    ? profiles.find((p: ConnectionProfile) => p._id === profileId)
    : null;

  // Данные устройств - фильтруем по выбранному профилю
  const allDevices = devicesResponse?.data || [];
  const profileDevices = profileId
    ? allDevices.filter((d: DevicePopulated) => d.connectionProfileId._id === profileId)
    : [];

  // Editing state из query params
  const searchParams = new URLSearchParams(window.location.search);
  const editingProfileId = searchParams.get('editProfile');
  const newDevice = searchParams.get('newDevice');
  const editingProfile = editingProfileId
    ? profiles.find((p: ConnectionProfile) => p._id === editingProfileId)
    : null;

  // Profile Handlers
  const handleAddProfile = () => {
    navigate('?newProfile=true');
    profileFormModal.open();
  };

  const handleEditProfile = (id: string) => {
    navigate(`?editProfile=${id}`);
    profileFormModal.open();
  };

  const handleDeleteProfile = (id: string) => {
    navigate(`?deleteProfile=${id}`);
    deleteProfileModal.open();
  };

  const confirmDeleteProfile = async () => {
    if (!editingProfileId) return;
    
    try {
      await deleteProfile(editingProfileId).unwrap();
      deleteProfileModal.close();
      navigate('/profiles');
      console.log('Профиль успешно удален');
    } catch (error) {
      console.error('Ошибка удаления профиля:', error);
    }
  };

  const handleProfileSubmit = async (data: CreateConnectionProfileDto) => {
    try {
      if (editingProfileId) {
        await updateProfile({ id: editingProfileId, data }).unwrap();
        console.log('Профиль успешно обновлен');
        profileFormModal.close();
        navigate(`/profiles/${editingProfileId}`);
      } else {
        const result = await createProfile(data).unwrap();
        console.log('Профиль успешно создан');
        profileFormModal.close();
        if (result.data?._id) {
          navigate(`/profiles/${result.data._id}`);
        } else {
          navigate('/profiles');
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
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
    profileFormModal.close();
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
    deleteProfileModal.close();
    if (profileId) {
      navigate(`/profiles/${profileId}`);
    } else {
      navigate('/profiles');
    }
  };

  // Данные для Sidebar
  const sidebarProfiles: Profile[] = profiles.map((profile: ConnectionProfile) => ({
    id: profile._id,
    name: profile.name,
    connectionType: profile.connectionType,
    isActive: true,
  }));

  // Открываем модалки при наличии query параметров
  const isNewProfile = searchParams.get('newProfile') === 'true';
  const isDeleteMode = searchParams.get('deleteProfile');
  
  if (isNewProfile && !profileFormModal.isOpen) {
    profileFormModal.open();
  } else if (!isNewProfile && !editingProfileId && profileFormModal.isOpen) {
    profileFormModal.close();
  }

  if (newDevice === 'true' && !deviceFormModal.isOpen) {
    deviceFormModal.open();
  } else if (newDevice !== 'true' && deviceFormModal.isOpen) {
    deviceFormModal.close();
  }

  if (isDeleteMode && !deleteProfileModal.isOpen) {
    deleteProfileModal.open();
  } else if (!isDeleteMode && deleteProfileModal.isOpen) {
    deleteProfileModal.close();
  }

  return {
    content: (
      <>
        <div className={styles['profiles-page']}>
          {isLoading ? (
            <div className={styles['profiles-page__loading']}>
              <p>Загрузка профилей...</p>
            </div>
          ) : selectedProfile ? (
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
                ) : profileDevices.length === 0 ? (
                  <div className={styles['profiles-page__empty-devices']}>
                    <p>Нет устройств</p>
                    <p>Добавьте первое устройство для этого профиля</p>
                  </div>
                ) : (
                  <div className={styles['profiles-page__devices']}>
                    {profileDevices.map((device: DevicePopulated) => (
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
                          <span>Шаблон: {device.registerTemplateId.name}</span>
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
              <h2>Выберите профиль</h2>
              <p>Выберите профиль из списка слева или создайте новый</p>
            </div>
          )}
        </div>

        {/* Модалка создания/редактирования профиля */}
        <Modal
          isOpen={profileFormModal.isOpen}
          onClose={handleCloseProfileModal}
          title={editingProfileId ? 'Редактирование профиля' : 'Создание профиля подключения'}
          size="lg"
        >
          <ProfileForm
            initialData={editingProfile || undefined}
            onSubmit={handleProfileSubmit}
            onCancel={handleCloseProfileModal}
            loading={isCreatingProfile || isUpdatingProfile}
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
              profileId={profileId}
              onSubmit={handleDeviceSubmit}
              onCancel={handleCloseDeviceModal}
              loading={isCreatingDevice}
            />
          )}
        </Modal>

        {/* Модалка подтверждения удаления профиля */}
        <Modal
          isOpen={deleteProfileModal.isOpen}
          onClose={handleCloseDeleteModal}
          title="Удаление профиля"
          size="sm"
        >
          <div className={styles['profiles-page__delete-modal']}>
            <p>
              Вы уверены, что хотите удалить профиль{' '}
              <strong>{editingProfile?.name}</strong>?
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
                loading={isDeletingProfile}
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
