import React, { useState, useCallback, useEffect } from 'react';
import { Add as AddIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Button } from '@/shared/ui/Button/Button';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { Modal } from '@/shared/ui/Modal/Modal';
import { PortsList, AddPortForm } from '@/features/settings/port';
import { useCreatePortMutation, useUpdatePortMutation } from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import type { Port, CreatePortData } from '@/features/settings/port/types';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const [createPort, { isLoading: isCreating }] = useCreatePortMutation();
  const [updatePort, { isLoading: isUpdating }] = useUpdatePortMutation();
  const { showSuccess, showError } = useSnackbar();

  // Управление видимостью floatingButtons с задержкой
  useEffect(() => {
    if (isCollapsed) {
      const timer = setTimeout(() => {
        setShowFloatingButtons(true);
      }, 150); 
      return () => clearTimeout(timer);
    } else {
      setShowFloatingButtons(false);
    }
  }, [isCollapsed]);

  const handleAddPort = useCallback(async (portData: CreatePortData) => {
    try {
      await createPort(portData).unwrap();
      setIsPortModalOpen(false);
      setEditingPort(null);
      showSuccess('Порт успешно создан');
    } catch (error) {
      showError(getErrorMessage(error));
    }
  }, [createPort, showSuccess, showError]);

  const handleEditPort = useCallback((port: Port) => {
    setEditingPort(port);
    setIsPortModalOpen(true);
  }, []);

  const handleUpdatePort = useCallback(async (portData: CreatePortData) => {
    if (!editingPort) return;
    try {
      await updatePort({ id: editingPort._id, data: portData }).unwrap();
      setIsPortModalOpen(false);
      setEditingPort(null);
      showSuccess('Порт успешно обновлен');
    } catch (error) {
      showError(getErrorMessage(error));
    }
  }, [editingPort, updatePort, showSuccess, showError]);

  const handleModalClose = useCallback(() => {
    setIsPortModalOpen(false);
    setEditingPort(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    setEditingPort(null);
    setIsPortModalOpen(true);
  }, []);

  return (
    <>
      <aside className={`${styles['sidebar']} ${isCollapsed ? styles['sidebar_collapsed'] : ''}`}>
        <div className={styles['sidebar__header']}>
          <div className={styles['sidebar__title']}>Порты</div>
          <IconButton
            icon={<ChevronLeft />}
            onClick={onToggle}
            className={styles['sidebar__toggle']}
          />
        </div>
        <div className={styles['sidebar__content']}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            fullWidth
            className={styles['sidebar__addButton']}
          >
            Добавить порт
          </Button>
          <div className={styles['sidebar__ports']}>
            <PortsList onEdit={handleEditPort} />
          </div>
        </div>
      </aside>

      <div className={`${styles['sidebar__floatingButtons']} ${showFloatingButtons ? styles['sidebar__floatingButtons_visible'] : ''}`}>
        <IconButton
          icon={<ChevronRight />}
          onClick={onToggle}
          tooltip="Развернуть боковую панель"
        />
        <IconButton
          icon={<AddIcon />}
          onClick={handleOpenModal}
          tooltip="Добавить порт"
        />
      </div>

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