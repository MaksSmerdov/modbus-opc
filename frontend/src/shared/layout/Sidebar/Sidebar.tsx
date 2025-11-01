import { useState } from 'react';
import { Button } from '@/shared/components';
import { ProfileCard } from './ProfileCard/ProfileCard';
import styles from './Sidebar.module.scss';

export interface Profile {
  id: string;
  name: string;
  connectionType: 'RTU' | 'TCP';
  isActive?: boolean;
}

export interface SidebarProps {
  profiles?: Profile[];
  selectedProfileId?: string | null;
  onProfileSelect?: (profileId: string) => void;
  onAddProfile?: () => void;
  onEditProfile?: (profileId: string) => void;
  onDeleteProfile?: (profileId: string) => void;
  onToggleActive?: (profileId: string, currentActive: boolean) => void;
  isPolling?: boolean;
}

export const Sidebar = ({ 
  profiles = [], 
  selectedProfileId = null,
  onProfileSelect,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onToggleActive,
  isPolling = false
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles['sidebar--collapsed'] : ''}`}>
      <div className={styles.sidebar__header}>
        <h2 className={styles.sidebar__title}>
          {!isCollapsed && 'Профили'}
        </h2>
        <button
          className={styles.sidebar__toggle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Развернуть' : 'Свернуть'}
        >
          <span className={styles.sidebar__toggle_icon}>
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className={styles.sidebar__content}>
            {profiles.length === 0 ? (
              <div className={styles.sidebar__empty}>
                <p>Нет профилей</p>
                <p className={styles.sidebar__empty_hint}>
                  Создайте первый профиль подключения
                </p>
              </div>
            ) : (
              <ul className={styles.sidebar__list}>
                {profiles.map((profile) => (
                  <li key={profile.id}>
                    <ProfileCard
                      profile={profile}
                      isSelected={selectedProfileId === profile.id}
                      onSelect={onProfileSelect!}
                      onEdit={onEditProfile}
                      onDelete={onDeleteProfile}
                      onToggleActive={onToggleActive}
                      isPolling={isPolling}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.sidebar__footer}>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={onAddProfile}
            >
              + Добавить профиль
            </Button>
          </div>
        </>
      )}
    </aside>
  );
};