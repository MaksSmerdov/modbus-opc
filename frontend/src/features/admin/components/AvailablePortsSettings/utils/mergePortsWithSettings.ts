import type { AvailablePortSettings } from '../../../api/availablePortsApi';
import type { AvailablePorts } from '@/features/settings/port/types/index';

export interface PortWithSettings extends AvailablePortSettings {
  isSystemPort: boolean;
}

export function mergePortsWithSettings(
  availablePorts: AvailablePorts[],
  settings: AvailablePortSettings[]
): PortWithSettings[] {
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
}

