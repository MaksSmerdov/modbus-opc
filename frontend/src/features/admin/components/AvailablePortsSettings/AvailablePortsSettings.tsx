import { useEffect, useState, useMemo } from 'react';
import { availablePortsApi, type AvailablePortSettings } from '../../api/availablePortsApi';
import { useGetAvailablePortsQuery } from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import { Table, type TableColumn } from '@/shared/components/Table/Table';
import styles from './AvailablePortsSettings.module.scss';

interface PortWithSettings extends AvailablePortSettings {
  isSystemPort: boolean;
}

export const AvailablePortsSettings = () => {
  const [settings, setSettings] = useState<AvailablePortSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPort, setEditingPort] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const { showSuccess, showError } = useSnackbar();
  
  // Получаем все доступные порты из системы (включая скрытые для админа)
  const { data: availablePorts = [] } = useGetAvailablePortsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await availablePortsApi.getPortsSettings();
      if (response.success) {
        setSettings(response.data);
      } else {
        setError(response.error);
        showError(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки настроек портов';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Объединяем системные порты с настройками
  const portsWithSettings = useMemo(() => {
    const settingsMap = new Map(settings.map(s => [s.portName, s]));
    const result: PortWithSettings[] = [];

    // Добавляем все системные порты
    availablePorts.forEach(port => {
      const existingSettings = settingsMap.get(port.name);
      if (existingSettings) {
        result.push({
          ...existingSettings,
          isSystemPort: true,
        });
      } else {
        // Создаем временный объект для порта без настроек
        result.push({
          _id: `temp-${port.name}`,
          portName: port.name,
          description: null,
          isHidden: false,
          createdAt: '',
          updatedAt: '',
          isSystemPort: true,
        });
      }
    });

    // Добавляем настройки для портов, которых уже нет в системе
    settings.forEach(setting => {
      if (!availablePorts.find(p => p.name === setting.portName)) {
        result.push({
          ...setting,
          isSystemPort: false,
        });
      }
    });

    return result.sort((a, b) => a.portName.localeCompare(b.portName));
  }, [availablePorts, settings]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (port: PortWithSettings) => {
    setEditingPort(port.portName);
    setEditDescription(port.description || '');
  };

  const handleSave = async (portName: string) => {
    try {
      const response = await availablePortsApi.updatePortSettings(portName, {
        description: editDescription || null
      });
      if (response.success) {
        setSettings(prev => {
          const existing = prev.find(s => s.portName === portName);
          if (existing) {
            return prev.map(s => s.portName === portName ? response.data : s);
          } else {
            return [...prev, response.data];
          }
        });
        setEditingPort(null);
        showSuccess('Настройки порта обновлены');
      } else {
        showError(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления настроек';
      showError(errorMessage);
    }
  };

  const handleCancel = () => {
    setEditingPort(null);
    setEditDescription('');
  };

  const handleToggleHidden = async (port: PortWithSettings) => {
    try {
      const response = await availablePortsApi.updatePortSettings(port.portName, {
        isHidden: !port.isHidden
      });
      if (response.success) {
        setSettings(prev => {
          const existing = prev.find(s => s.portName === port.portName);
          if (existing) {
            return prev.map(s => s.portName === port.portName ? response.data : s);
          } else {
            return [...prev, response.data];
          }
        });
        showSuccess(`Порт ${port.isHidden ? 'показан' : 'скрыт'}`);
      } else {
        showError(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления видимости';
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return <div className={styles['availablePortsSettings__loading']}>Загрузка...</div>;
  }

  if (error) {
    return (
      <div className={styles['availablePortsSettings__error']}>
        <p>{error}</p>
        <Button onClick={fetchSettings} variant="outlined" size="small">
          Попробовать снова
        </Button>
      </div>
    );
  }

  const columns: TableColumn[] = [
    { key: 'portName', label: 'COM порт' },
    { key: 'description', label: 'Описание' },
    { key: 'isHidden', label: 'Видимость' },
    { key: 'actions', label: 'Действия' },
  ];

  return (
    <div className={styles['availablePortsSettings']}>
      <div className={styles['availablePortsSettings__header']}>
        <h2 className={styles['availablePortsSettings__title']}>Настройки COM-портов</h2>
        <Button onClick={fetchSettings} variant="outlined" size="small">
          Обновить
        </Button>
      </div>

      <Table
        columns={columns}
        data={portsWithSettings}
        emptyMessage="Нет доступных портов"
        renderRow={(port) => (
          <tr key={port._id}>
            <td>
              {port.portName}
              {!port.isSystemPort && (
                <span className={styles['availablePortsSettings__notFound']}> (не найден)</span>
              )}
            </td>
            <td>
              {editingPort === port.portName ? (
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Введите описание"
                  size="small"
                />
              ) : (
                <span>{port.description || '—'}</span>
              )}
            </td>
            <td>
              <span className={port.isHidden ? styles['availablePortsSettings__hidden'] : ''}>
                {port.isHidden ? 'Скрыт' : 'Видим'}
              </span>
            </td>
            <td>
              {editingPort === port.portName ? (
                <>
                  <Button
                    onClick={() => handleSave(port.portName)}
                    variant="contained"
                    size="small"
                  >
                    Сохранить
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    size="small"
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleEdit(port)}
                    variant="outlined"
                    size="small"
                  >
                    Редактировать
                  </Button>
                  <Button
                    onClick={() => handleToggleHidden(port)}
                    variant={port.isHidden ? 'contained' : 'outlined'}
                    size="small"
                  >
                    {port.isHidden ? 'Показать' : 'Скрыть'}
                  </Button>
                </>
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
};

