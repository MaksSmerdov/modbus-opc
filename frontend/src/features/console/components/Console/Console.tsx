import { useEffect, useRef, useState } from 'react';
import { useGetLogsQuery, useClearLogsMutation, type LogLevel } from '@/features/console/api/logsApi';
import { Button } from '@/shared/ui/Button/Button';
import { Select } from '@/shared/ui/Select/Select';
import { MenuItem } from '@mui/material';
import { Delete, Close } from '@mui/icons-material';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import styles from './Console.module.scss';

interface ConsoleProps {
  maxHeight?: string;
  pollingInterval?: number;
  onClose?: () => void;
}

export const Console = ({ maxHeight = '400px', pollingInterval = 2000, onClose }: ConsoleProps) => {
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: logs = [], isLoading } = useGetLogsQuery(
    { limit: 500, level: selectedLevel === 'all' ? undefined : selectedLevel },
    { pollingInterval }
  );

  const [clearLogs, { isLoading: isClearing }] = useClearLogsMutation();

  // Автопрокрутка
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Отслеживание прокрутки для отключения автопрокрутки
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const handleClear = async () => {
    try {
      await clearLogs().unwrap();
    } catch (error) {
      console.error('Ошибка очистки логов:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const getLogClassName = (level: LogLevel) => {
    return `${styles['console__log']} ${styles[`console__log_${level}`]}`;
  };

  return (
    <div className={styles['console']}>
      <div className={styles['console__header']}>
        <h3 className={styles['console__title']}>Консоль</h3>
        <div className={styles['console__controls']}>
          <Select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
            fullWidth={false}
            helperText=""
            className={styles['console__select']}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="log">Инфо</MenuItem>
            <MenuItem value="warn">Предупреждения</MenuItem>
            <MenuItem value="error">Ошибки</MenuItem>
          </Select>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClear}
            disabled={isClearing || logs.length === 0}
            startIcon={<Delete />}
          >
            Очистить
          </Button>
        </div>
        {onClose && <IconButton icon={<Close />} onClick={onClose} className={styles['console__close']} />}
      </div>
      <div ref={containerRef} className={styles['console__content']} style={{ maxHeight }} onScroll={handleScroll}>
        {isLoading && logs.length === 0 ? (
          <div className={styles['console__empty']}>Загрузка логов...</div>
        ) : logs.length === 0 ? (
          <div className={styles['console__empty']}>Нет логов</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={getLogClassName(log.level)}>
              <span className={styles['console__timestamp']}>{formatTimestamp(log.timestamp)}</span>
              <span className={styles['console__level']}>[{log.level.toUpperCase()}]</span>
              <span className={styles['console__message']}>{log.message}</span>
              {log.deviceName && <span className={styles['console__metadata']}>Device: {log.deviceName}</span>}
              {log.portName && <span className={styles['console__metadata']}>Port: {log.portName}</span>}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

