import { Button } from '../../../../../shared/ui/Button/Button';
import styles from './AuditLogsPagination.module.scss';

interface AuditLogsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const AuditLogsPagination = ({
    currentPage,
    totalPages,
    onPageChange
}: AuditLogsPaginationProps) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={styles['auditLogsPagination']}>
            <Button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outlined"
                size="small"
            >
                Назад
            </Button>
            <span className={styles['auditLogsPagination__info']}>
                Страница {currentPage} из {totalPages}
            </span>
            <Button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                variant="outlined"
                size="small"
            >
                Вперед
            </Button>
        </div>
    );
};

