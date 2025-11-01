import { useGetPollingStatusQuery } from '../../api/pollingApi';
import styles from './PollingStatusInfo.module.scss';

interface PollingStatusInfoProps {
  portIsActive?: boolean;
  deviceIsActive?: boolean;
  showDeviceLevel?: boolean;
}

export const PollingStatusInfo = ({ 
  portIsActive, 
  deviceIsActive,
  showDeviceLevel = false 
}: PollingStatusInfoProps) => {
  const { data: status } = useGetPollingStatusQuery();
  
  const globalEnabled = status?.isPollingEnabled ?? false;
  const globalActive = status?.isPolling ?? false;

  const levels = [
    {
      name: 'Глобальный опрос',
      description: 'Управляет всеми устройствами',
      enabled: globalEnabled,
      active: globalActive,
      icon: '🌐',
      show: true,
    },
    {
      name: 'Опрос порта',
      description: 'Управляет устройствами на порту',
      enabled: portIsActive ?? true,
      active: globalActive && (portIsActive ?? true),
      icon: '🔌',
      show: portIsActive !== undefined,
    },
    {
      name: 'Опрос устройства',
      description: 'Управляет конкретным устройством',
      enabled: deviceIsActive ?? true,
      active: globalActive && (portIsActive ?? true) && (deviceIsActive ?? true),
      icon: '📡',
      show: showDeviceLevel && deviceIsActive !== undefined,
    },
  ];

  return (
    <div className={styles['polling-status-info']}>
      <div className={styles['polling-status-info__title']}>
        Уровни управления опросом
      </div>
      
      <div className={styles['polling-status-info__levels']}>
        {levels.filter(l => l.show).map((level, index) => (
          <div 
            key={level.name}
            className={`${styles['polling-status-info__level']} ${
              !level.enabled ? styles['polling-status-info__level--disabled'] : ''
            }`}
          >
            <div className={styles['polling-status-info__level-icon']}>
              {level.icon}
            </div>
            <div className={styles['polling-status-info__level-content']}>
              <div className={styles['polling-status-info__level-header']}>
                <span className={styles['polling-status-info__level-name']}>
                  Уровень {index + 1}: {level.name}
                </span>
                <span className={`${styles['polling-status-info__level-badge']} ${
                  level.active ? styles['polling-status-info__level-badge--active'] : ''
                }`}>
                  {level.active ? '✓ Активен' : level.enabled ? '⏸ Готов' : '✗ Отключен'}
                </span>
              </div>
              <div className={styles['polling-status-info__level-description']}>
                {level.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!globalEnabled && (
        <div className={styles['polling-status-info__hint']}>
          💡 Запустите глобальный опрос через кнопку в Header
        </div>
      )}
    </div>
  );
};

