import { MdEdit, MdDelete } from 'react-icons/md';
import styles from './ProfileCard.module.scss';
import type { Profile } from '../Sidebar';

export interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
  onEdit?: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
  onToggleActive?: (profileId: string, currentActive: boolean) => void;
  isPolling?: boolean;
}

export const ProfileCard = ({ 
  profile, 
  isSelected, 
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
  isPolling = false
}: ProfileCardProps) => {
  // Если isActive не определен (старые порты), считаем его активным
  const isActive = profile.isActive ?? true;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(profile.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(profile.id);
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleActive?.(profile.id, isActive);
  };

  return (
    <div
      className={`${styles['profile-card']} ${
        isSelected ? styles['profile-card--active'] : ''
      } ${!isActive ? styles['profile-card--inactive'] : ''}`}
      onClick={() => onSelect(profile.id)}
    >
      <div className={styles['profile-card__header']}>
        <span className={styles['profile-card__name']}>
          {profile.name}
        </span>
        <div className={styles['profile-card__actions']}>
          {onToggleActive && (
            <button
              type="button"
              className={`${styles['profile-card__toggle']} ${
                isActive ? styles['profile-card__toggle--active'] : ''
              }`}
              onClick={handleToggleActive}
              title={
                isPolling && isActive
                  ? 'Уровень 2: Нельзя отключить порт при активном глобальном опросе'
                  : isActive 
                    ? 'Уровень 2: Отключить опрос порта (все устройства на порту)' 
                    : 'Уровень 2: Включить опрос порта (все устройства на порту)'
              }
              aria-label={isActive ? 'Отключить порт' : 'Включить порт'}
            >
              🔌 {isActive ? '✓' : '✗'}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className={styles['profile-card__action-btn']}
              onClick={handleEdit}
              title={isPolling ? 'Недоступно при активном опросе' : 'Редактировать профиль'}
              aria-label="Редактировать профиль"
              disabled={isPolling}
            >
              <MdEdit size={18} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={`${styles['profile-card__action-btn']} ${styles['profile-card__action-btn--danger']}`}
              onClick={handleDelete}
              title={isPolling ? 'Недоступно при активном опросе' : 'Удалить профиль'}
              aria-label="Удалить профиль"
              disabled={isPolling}
            >
              <MdDelete size={18} />
            </button>
          )}
        </div>
      </div>
      {!isActive && (
        <div className={styles['profile-card__status']}>
          <span className={styles['profile-card__status-label']}>Отключен</span>
        </div>
      )}
    </div>
  );
};
