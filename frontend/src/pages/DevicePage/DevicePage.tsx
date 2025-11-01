import { useParams, useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdArrowBack } from 'react-icons/md';
import { Modal, Button } from '@/shared/components';
import { useModal } from '@/shared/hooks/useModal';
import { TagForm } from '@/features/config/components';
import { PollingStatusInfo } from '@/features/polling/components';
import {
  useGetDeviceQuery,
  useGetDeviceTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from '@/features/config/api';
import { useGetPollingStatusQuery } from '@/features/polling/api';
import type { CreateTagDto, UpdateTagDto, Tag } from '@/features/config/types/config.types';
import styles from './DevicePage.module.scss';

export const DevicePage = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const tagFormModal = useModal();
  const deleteTagModal = useModal();

  // API hooks
  const { data: deviceResponse, isLoading: isLoadingDevice } = useGetDeviceQuery(deviceId || '', {
    skip: !deviceId,
  });
  const { data: tagsResponse, isLoading: isLoadingTags } = useGetDeviceTagsQuery(deviceId || '', {
    skip: !deviceId,
  });
  const [createTag, { isLoading: isCreatingTag }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdatingTag }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeletingTag }] = useDeleteTagMutation();

  // Polling status
  const { data: pollingStatus } = useGetPollingStatusQuery();
  const isPolling = pollingStatus?.isPolling ?? false;

  const device = deviceResponse?.data;
  const tags = tagsResponse?.data || [];

  // Editing state
  const searchParams = new URLSearchParams(window.location.search);
  const editingTagId = searchParams.get('editTag');
  const deletingTagId = searchParams.get('deleteTag');
  const editingTag = editingTagId ? tags.find((t: Tag) => t._id === editingTagId) : null;
  const deletingTag = deletingTagId ? tags.find((t: Tag) => t._id === deletingTagId) : null;

  // Handlers
  const handleBack = () => {
    if (device?.portId && typeof device.portId !== 'string') {
      navigate(`/profiles/${device.portId._id}`);
    } else {
      navigate('/profiles');
    }
  };

  const handleAddTag = () => {
    navigate('?newTag=true');
    tagFormModal.open();
  };

  const handleEditTag = (tagId: string) => {
    if (isPolling) {
      alert('Нельзя редактировать тэг во время опроса. Остановите опрос в Header.');
      return;
    }
    navigate(`?editTag=${tagId}`);
    tagFormModal.open();
  };

  const handleDeleteTag = (tagId: string) => {
    if (isPolling) {
      alert('Нельзя удалять тэг во время опроса. Остановите опрос в Header.');
      return;
    }
    navigate(`?deleteTag=${tagId}`);
    deleteTagModal.open();
  };

  const confirmDeleteTag = async () => {
    if (!deviceId || !deletingTagId) return;

    try {
      await deleteTag({ deviceId, tagId: deletingTagId }).unwrap();
      deleteTagModal.close();
      navigate(`/devices/${deviceId}`);
      console.log('Тэг успешно удален');
    } catch (error) {
      console.error('Ошибка удаления тэга:', error);
    }
  };

  const handleTagSubmit = async (data: CreateTagDto | UpdateTagDto) => {
    if (!deviceId) return;

    try {
      if (editingTagId) {
        await updateTag({ deviceId, tagId: editingTagId, data: data as UpdateTagDto }).unwrap();
        console.log('Тэг успешно обновлен');
      } else {
        await createTag({ deviceId, data: data as CreateTagDto }).unwrap();
        console.log('Тэг успешно создан');
      }
      tagFormModal.close();
      navigate(`/devices/${deviceId}`);
    } catch (error) {
      console.error('Ошибка сохранения тэга:', error);
    }
  };

  const handleCloseTagModal = () => {
    tagFormModal.close();
    navigate(`/devices/${deviceId}`);
  };

  const handleCloseDeleteModal = () => {
    deleteTagModal.close();
    navigate(`/devices/${deviceId}`);
  };

  // Открываем модалки при наличии query параметров
  const isNewTag = searchParams.get('newTag') === 'true';
  const isDeleteMode = searchParams.get('deleteTag');

  if (isNewTag && !tagFormModal.isOpen) {
    tagFormModal.open();
  } else if (!isNewTag && !editingTagId && tagFormModal.isOpen) {
    tagFormModal.close();
  }

  if (isDeleteMode && !deleteTagModal.isOpen) {
    deleteTagModal.open();
  } else if (!isDeleteMode && deleteTagModal.isOpen) {
    deleteTagModal.close();
  }

  if (!deviceId) {
    return (
      <div className={styles['device-page__error']}>
        <p>Устройство не найдено</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles['device-page']}>
        {/* Header */}
        <div className={styles['device-page__header']}>
          <Button variant="secondary" size="sm" onClick={handleBack}>
            <MdArrowBack size={18} />
            Назад
          </Button>

          {device && (
            <div className={styles['device-page__title']}>
              <h1>{device.name}</h1>
              <span className={styles['device-page__subtitle']}>
                Slave ID: {device.slaveId} | Порт: {typeof device.portId !== 'string' ? device.portId.name : ''}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoadingDevice ? (
          <div className={styles['device-page__loading']}>
            <p>Загрузка устройства...</p>
          </div>
        ) : device ? (
          <div className={styles['device-page__content']}>
            {/* Информация об уровнях опроса */}
            <PollingStatusInfo 
              portIsActive={typeof device.portId !== 'string' ? device.portId.isActive : undefined}
              deviceIsActive={device.isActive ?? true}
              showDeviceLevel={true}
            />

            {/* Tags Section */}
            <div className={styles['device-page__section']}>
              <div className={styles['device-page__section-header']}>
                <h2>Тэги устройства</h2>
                <Button variant="primary" size="sm" onClick={handleAddTag}>
                  <MdAdd size={18} />
                  Добавить тэг
                </Button>
              </div>

              {isLoadingTags ? (
                <p>Загрузка тэгов...</p>
              ) : tags.length === 0 ? (
                <div className={styles['device-page__empty']}>
                  <p>Тэги не добавлены</p>
                  <p>Добавьте первый тэг для начала работы с устройством</p>
                </div>
              ) : (
                <div className={styles['device-page__table-wrapper']}>
                  <table className={styles['device-page__table']}>
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Адрес</th>
                        <th>Длина</th>
                        <th>Тип данных</th>
                        <th>Функция</th>
                        <th>Категория</th>
                        <th>Единица</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tags.map((tag: Tag) => (
                        <tr key={tag._id}>
                          <td>
                            <div className={styles['device-page__tag-name']}>
                              {tag.name}
                              {tag.description && (
                                <span className={styles['device-page__tag-description']}>
                                  {tag.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{tag.address}</td>
                          <td>{tag.length}</td>
                          <td>{tag.dataType}</td>
                          <td>{tag.functionCode}</td>
                          <td>{tag.category}</td>
                          <td>{tag.unit || '-'}</td>
                          <td>
                            <div className={styles['device-page__actions']}>
                              <button
                                className={styles['device-page__action-btn']}
                                onClick={() => handleEditTag(tag._id)}
                                title={isPolling ? 'Недоступно при активном опросе' : 'Редактировать'}
                                disabled={isPolling}
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                className={`${styles['device-page__action-btn']} ${styles['device-page__action-btn--delete']}`}
                                onClick={() => handleDeleteTag(tag._id)}
                                title={isPolling ? 'Недоступно при активном опросе' : 'Удалить'}
                                disabled={isPolling}
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles['device-page__error']}>
            <p>Устройство не найдено</p>
          </div>
        )}
      </div>

      {/* Модалка создания/редактирования тэга */}
      <Modal
        isOpen={tagFormModal.isOpen}
        onClose={handleCloseTagModal}
        title={editingTagId ? 'Редактирование тэга' : 'Добавление тэга'}
        size="lg"
      >
        <TagForm
          initialData={editingTag || undefined}
          onSubmit={handleTagSubmit}
          onCancel={handleCloseTagModal}
          loading={isCreatingTag || isUpdatingTag}
        />
      </Modal>

      {/* Модалка подтверждения удаления тэга */}
      <Modal
        isOpen={deleteTagModal.isOpen}
        onClose={handleCloseDeleteModal}
        title="Удаление тэга"
        size="sm"
      >
        <div className={styles['device-page__delete-modal']}>
          <p>
            Вы уверены, что хотите удалить тэг <strong>{deletingTag?.name}</strong>?
          </p>
          <p className={styles['device-page__delete-warning']}>Это действие нельзя отменить.</p>
          <div className={styles['device-page__delete-actions']}>
            <Button type="button" variant="secondary" onClick={handleCloseDeleteModal}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDeleteTag}
              loading={isDeletingTag}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

