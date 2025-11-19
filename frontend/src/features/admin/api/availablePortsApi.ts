import { api } from '@/shared/api/api';

export interface AvailablePortSettings {
  _id: string;
  portName: string;
  description: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAvailablePortSettingsData {
  description?: string | null;
  isHidden?: boolean;
}

export interface AvailablePortSettingsResponse {
  success: true;
  count: number;
  data: AvailablePortSettings[];
}

export interface AvailablePortSettingsItemResponse {
  success: true;
  data: AvailablePortSettings;
}

export const availablePortsApi = {
  // Получить настройки всех портов
  getPortsSettings: async () => {
    return api.get<AvailablePortSettings[]>('/config/available-ports');
  },

  // Обновить настройки порта
  updatePortSettings: async (portName: string, data: UpdateAvailablePortSettingsData) => {
    return api.put<AvailablePortSettings>(`/config/available-ports/${portName}`, data);
  },

  // Удалить настройки порта
  deletePortSettings: async (portName: string) => {
    return api.delete(`/config/available-ports/${portName}`);
  },
};

