import { useState, useCallback } from 'react';
import { 
  useGetAvailablePortsSettingsQuery,
  useUpdateAvailablePortSettingsMutation 
} from '@/features/settings/port/api/portsApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';

export function useAvailablePortsSettings() {
  const { showSuccess, showError } = useSnackbar();
  const [editingPortName, setEditingPortName] = useState<string | null>(null);

  const { 
    data: settings = [], 
    isLoading, 
    error,
    refetch 
  } = useGetAvailablePortsSettingsQuery();

  const [updatePortSettings, { isLoading: isUpdating }] = useUpdateAvailablePortSettingsMutation();

  const handleOpenModal = useCallback((portName: string) => {
    setEditingPortName(portName);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingPortName(null);
  }, []);

  const handleSave = useCallback(async (
    portName: string,
    description: string | null,
    isHidden: boolean
  ) => {
    try {
      await updatePortSettings({
        portName,
        data: { description, isHidden }
      }).unwrap();
      setEditingPortName(null);
      showSuccess('Настройки порта обновлены');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Ошибка обновления настроек';
      showError(errorMessage);
    }
  }, [updatePortSettings, showSuccess, showError]);

  return {
    settings,
    isLoading,
    error,
    refetch,
    editingPortName,
    isUpdating,
    handleOpenModal,
    handleCloseModal,
    handleSave,
  };
}

