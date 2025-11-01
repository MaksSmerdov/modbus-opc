import { MdEdit, MdDelete } from 'react-icons/md';
import styles from './ProfileCard.module.scss';
import type { Profile } from '../Sidebar';

export interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
  onEdit?: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
}

export const ProfileCard = ({ 
  profile, 
  isSelected, 
  onSelect,
  onEdit,
  onDelete 
}: ProfileCardProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(profile.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(profile.id);
  };

  return (
    <div
      className={`${styles['profile-card']} ${
        isSelected ? styles['profile-card--active'] : ''
      }`}
      onClick={() => onSelect(profile.id)}
    >
      <div className={styles['profile-card__header']}>
        <span className={styles['profile-card__name']}>
          {profile.name}
        </span>
        <div className={styles['profile-card__actions']}>
          {onEdit && (
            <button
              type="button"
              className={styles['profile-card__action-btn']}
              onClick={handleEdit}
              title="Редактировать профиль"
              aria-label="Редактировать профиль"
            >
              <MdEdit size={18} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={`${styles['profile-card__action-btn']} ${styles['profile-card__action-btn--danger']}`}
              onClick={handleDelete}
              title="Удалить профиль"
              aria-label="Удалить профиль"
            >
              <MdDelete size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
