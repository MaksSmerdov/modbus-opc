import { useMemo } from 'react';
import { useGetAvailablePortsQuery } from '@/features/settings/port/api/portsApi';
import { Button } from '@/shared/ui/Button/Button';
import { Table, type TableColumn } from '@/shared/components/Table/Table';
import { useAvailablePortsSettings } from './hooks/useAvailablePortsSettings';
import { mergePortsWithSettings, type PortWithSettings } from './utils/mergePortsWithSettings';
import { PortRow } from './components/PortRow/PortRow';
import { EditPortModal } from './components/EditPortModal/EditPortModal';
import styles from './AvailablePortsSettings.module.scss';

export const AvailablePortsSettings = () => {
  const {
    settings,
    isLoading,
    error,
    refetch,
    editingPortName,
    isUpdating,
    handleOpenModal,
    handleCloseModal,
    handleSave,
  } = useAvailablePortsSettings();

  const { data: availablePorts = [] } = useGetAvailablePortsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const portsWithSettings = useMemo(
    () => mergePortsWithSettings(availablePorts, settings),
    [availablePorts, settings]
  );

  const editingPort = useMemo(
    () => portsWithSettings.find(p => p.portName === editingPortName) || null,
    [portsWithSettings, editingPortName]
  );

  const columns: TableColumn[] = [
    { key: 'portName', label: 'COM порт' },
    { key: 'description', label: 'Описание' },
    { key: 'isHidden', label: 'Видимость' },
    { key: 'actions', label: 'Действия' },
  ];

  if (isLoading) {
    return (
      <div className={styles['availablePortsSettings__loading']}>
        Загрузка...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['availablePortsSettings__error']}>
        <p>{'data' in error ? String(error.data) : 'Ошибка загрузки настроек'}</p>
        <Button onClick={() => refetch()} variant="outlined" size="small">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className={styles['availablePortsSettings']}>
      <div className={styles['availablePortsSettings__header']}>
        <h2 className={styles['availablePortsSettings__title']}>
          Настройки COM-портов
        </h2>
        <Button onClick={() => refetch()} variant="outlined" size="small">
          Обновить
        </Button>
      </div>

      <Table
        columns={columns}
        data={portsWithSettings}
        emptyMessage="Нет доступных портов"
        renderRow={(port: PortWithSettings) => (
          <PortRow
            key={port._id}
            port={port}
            onEdit={() => handleOpenModal(port.portName)}
          />
        )}
      />

      <EditPortModal
        open={editingPortName !== null}
        onClose={handleCloseModal}
        port={editingPort}
        onSave={handleSave}
        isLoading={isUpdating}
      />
    </div>
  );
};

