import { useState, useEffect } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import type { PortWithSettings } from '../../utils/mergePortsWithSettings';
import styles from './EditPortModal.module.scss';

interface EditPortModalProps {
  open: boolean;
  onClose: () => void;
  port: PortWithSettings | null;
  onSave: (portName: string, description: string | null, isHidden: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const EditPortModal = ({
  open,
  onClose,
  port,
  onSave,
  isLoading = false,
}: EditPortModalProps) => {
  const [description, setDescription] = useState('');
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (port) {
      setDescription(port.description || '');
      setIsHidden(port.isHidden);
    }
  }, [port, open]);

  const handleSave = async () => {
    if (!port) return;
    await onSave(port.portName, description.trim() || null, isHidden);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!port) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Редактировать порт ${port.portName}`}
      maxWidth="sm"
      fullWidth
      disableBackdropClick={isLoading}
      disableEscapeKeyDown={isLoading}
      actions={
        <>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </>
      }
    >
      <div className={styles['editPortModal']}>
        <div className={styles['editPortModal__field']}>
          <Input
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание порта"
            fullWidth
            disabled={isLoading}
          />
        </div>
        <div className={styles['editPortModal__field']}>
          <FormControlLabel
            control={
              <Switch
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Скрыть порт"
            className={styles['editPortModal__switch']}
          />
        </div>
      </div>
    </Modal>
  );
};

