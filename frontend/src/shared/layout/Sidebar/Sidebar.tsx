import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@/shared/ui/Button/Button';
import { Modal } from '@/shared/ui/Modal/Modal';
import { PortsList, AddPortForm } from '@/features/settings/port';
import { useCreatePortMutation } from '@/features/settings/port/api/portsApi';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [isAddPortModalOpen, setIsAddPortModalOpen] = useState(false);
  const [createPort, { isLoading: isCreating }] = useCreatePortMutation();

  const handleAddPort = async (portData: Parameters<typeof createPort>[0]) => {
    try {
      await createPort(portData).unwrap();
      setIsAddPortModalOpen(false);
    } catch (error) {
      console.error('Ошибка создания порта:', error);
      alert('Не удалось создать порт');
    }
  };

  return (
    <>
      <aside className={`${styles['sidebar']} ${isCollapsed ? styles['sidebar_collapsed'] : ''}`}>
        <div className={styles['sidebar__header']}>
          {!isCollapsed && (
            <div className={styles['sidebar__title']}>Порты</div>
          )}
          <button
            onClick={onToggle}
            className={styles['sidebar__toggle']}
            type="button"
            aria-label={isCollapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
          >
            <span className={styles['sidebar__toggle-icon']}>
              {isCollapsed ? '›' : '‹'}
            </span>
          </button>
        </div>
        <div className={styles['sidebar__content']}>
          {!isCollapsed && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setIsAddPortModalOpen(true)}
              fullWidth
              className={styles['sidebar__addButton']}
            >
              Добавить порт
            </Button>
          )}
          <div className={styles['sidebar__ports']}>
            <PortsList isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>

      <Modal
        open={isAddPortModalOpen}
        onClose={() => setIsAddPortModalOpen(false)}
        title="Добавить порт"
        maxWidth="sm"
        fullWidth
      >
        <AddPortForm
          onSubmit={handleAddPort}
          onCancel={() => setIsAddPortModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>
    </>
  );
};

export default Sidebar;