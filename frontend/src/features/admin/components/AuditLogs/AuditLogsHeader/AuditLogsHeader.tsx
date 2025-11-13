import { Button } from '../../../../../shared/ui/Button/Button';
import styles from './AuditLogsHeader.module.scss';

interface AuditLogsHeaderProps {
    entityTypeFilter: string;
    onFilterChange: (value: string) => void;
    onRefresh: () => void;
    onDeleteDateClick: () => void;
    onDeleteAllClick: () => void;
}

export const AuditLogsHeader = ({
    entityTypeFilter,
    onFilterChange,
    onRefresh,
    onDeleteDateClick,
    onDeleteAllClick
}: AuditLogsHeaderProps) => {
    return (
        <div className={styles['auditLogsHeader']}>
            <h2 className={styles['auditLogsHeader__title']}>Журнал изменений</h2>
            <div className={styles['auditLogsHeader__controls']}>
                <select
                    className={styles['auditLogsHeader__filter']}
                    value={entityTypeFilter}
                    onChange={(e) => onFilterChange(e.target.value)}
                >
                    <option value="">Все типы</option>
                    <option value="device">Устройства</option>
                    <option value="port">Порты</option>
                    <option value="tag">Теги</option>
                    <option value="user">Пользователи</option>
                    <option value="polling">Опрос</option>
                </select>
                <Button onClick={onRefresh} variant="outlined" size="small">
                    Обновить
                </Button>
                <Button
                    onClick={onDeleteDateClick}
                    variant="outlined"
                    size="small"
                    className={styles['auditLogsHeader__delete-button']}
                >
                    Удалить за день
                </Button>
                <Button
                    onClick={onDeleteAllClick}
                    variant="outlined"
                    size="small"
                    className={styles['auditLogsHeader__delete-button']}
                >
                    Удалить все
                </Button>
            </div>
        </div>
    );
};
