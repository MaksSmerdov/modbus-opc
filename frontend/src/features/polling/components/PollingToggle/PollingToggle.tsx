import { useState } from 'react';
import { Button } from '@/shared/components';
import { 
  useGetPollingStatusQuery, 
  useStartPollingMutation, 
  useStopPollingMutation 
} from '../../api/pollingApi';
import styles from './PollingToggle.module.scss';

const PollingToggle = () => {
  const { data: status } = useGetPollingStatusQuery(undefined, {
    pollingInterval: 3000, // Обновляем статус каждые 3 секунды
  });

  const [startPolling, { isLoading: isStarting }] = useStartPollingMutation();
  const [stopPolling, { isLoading: isStopping }] = useStopPollingMutation();
  const [error, setError] = useState<string | null>(null);

  const isLoading = isStarting || isStopping;
  const isPolling = status?.isPolling ?? false;
  const hasManager = status?.hasManager ?? false;

  const handleToggle = async () => {
    try {
      setError(null);
      
      if (isPolling) {
        await stopPolling().unwrap();
      } else {
        await startPolling().unwrap();
      }
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'data' in err 
        ? (err.data as { message?: string }).message || 'Ошибка управления опросом'
        : 'Ошибка управления опросом';
      setError(errorMessage);
      
      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className={styles['polling-toggle']}>
      <Button
        onClick={handleToggle}
        disabled={isLoading || !hasManager}
        variant={isPolling ? 'danger' : 'primary'}
        className={styles['polling-toggle__button']}
        title={
          !hasManager 
            ? 'Modbus не инициализирован' 
            : isPolling 
              ? 'Уровень 1: Остановить глобальный опрос всех устройств' 
              : 'Уровень 1: Запустить глобальный опрос всех устройств'
        }
      >
        <span className={styles['polling-toggle__indicator']}>
          <span 
            className={`${styles['polling-toggle__dot']} ${
              isPolling ? styles['polling-toggle__dot--active'] : ''
            }`}
          />
        </span>
        <span className={styles['polling-toggle__text']}>
          🌐 {isLoading ? 'Обработка...' : isPolling ? 'Остановить глобальный опрос' : 'Запустить глобальный опрос'}
        </span>
      </Button>
      
      {error && (
        <div className={styles['polling-toggle__error']}>
          {error}
        </div>
      )}

      {!hasManager && (
        <div className={styles['polling-toggle__warning']}>
          Modbus не инициализирован
        </div>
      )}
    </div>
  );
};

export default PollingToggle;

