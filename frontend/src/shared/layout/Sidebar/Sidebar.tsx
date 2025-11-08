import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@/shared/ui/Button/Button';
import { Modal } from '@/shared/ui/Modal/Modal';
import { PortsList, AddPortForm } from '@/features/settings/port';
import { useCreatePortMutation, useUpdatePortMutation } from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/ui/SnackbarProvider';
import type { Port, CreatePortData } from '@/features/settings/port/types';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [createPort, { isLoading: isCreating }] = useCreatePortMutation();
  const [updatePort, { isLoading: isUpdating }] = useUpdatePortMutation();
  const { showSuccess, showError } = useSnackbar();

  const handleAddPort = async (portData: CreatePortData) => {
    try {
      await createPort(portData).unwrap();
      setIsPortModalOpen(false);
      setEditingPort(null);
      showSuccess('Порт успешно создан');
    } catch (error) {
      console.error('Ошибка создания порта:', error);
      showError('Не удалось создать порт');
    }
  };

  const handleEditPort = (port: Port) => {
    setEditingPort(port);
    setIsPortModalOpen(true);
  };

  const handleUpdatePort = async (portData: CreatePortData) => {
    if (!editingPort) return;
    try {
      await updatePort({ id: editingPort._id, data: portData }).unwrap();
      setIsPortModalOpen(false);
      setEditingPort(null);
      showSuccess('Порт успешно обновлен');
    } catch (error) {
      console.error('Ошибка обновления порта:', error);
      showError('Не удалось обновить порт');
    }
  };

  const handleModalClose = () => {
    setIsPortModalOpen(false);
    setEditingPort(null);
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
              onClick={() => {
                setEditingPort(null);
                setIsPortModalOpen(true);
              }}
              fullWidth
              className={styles['sidebar__addButton']}
            >
              Добавить порт
            </Button>
          )}
          <div className={styles['sidebar__ports']}>
            <PortsList isCollapsed={isCollapsed} onEdit={handleEditPort} />
          </div>
        </div>
      </aside>

      <Modal
        open={isPortModalOpen}
        onClose={handleModalClose}
        title={editingPort ? 'Редактировать порт' : 'Добавить порт'}
        maxWidth="sm"
        fullWidth
      >
        <AddPortForm
          onSubmit={editingPort ? handleUpdatePort : handleAddPort}
          onCancel={handleModalClose}
          isLoading={isCreating || isUpdating}
          initialData={editingPort || undefined}
          mode={editingPort ? 'edit' : 'create'}
        />
      </Modal>
    </>
  );
};

export default Sidebar;