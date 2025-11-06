import { Settings, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Port } from '../../types';
import { transliterate } from '@/shared/utils/transliterate';
import styles from './PortCard.module.scss';

interface PortCardProps {
    port: Port;
    onEdit?: (port: Port) => void;
    onDelete?: (portId: string) => void;
    isCollapsed?: boolean;
}

export const PortCard = ({ port, onEdit, onDelete, isCollapsed = false }: PortCardProps) => {
    const navigate = useNavigate();

    const getPortInfo = () => {
        if (port.connectionType === 'RTU') {
            return `${port.port}`;
        } else {
            return `${port.host}:${port.tcpPort}`;
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке редактирования/удаления
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        const slug = transliterate(port.name);
        navigate(`/${slug}`);
    };

    if (isCollapsed) {
        return (
            <div
                className={styles['portCard']}
                title={port.name}
                onClick={handleCardClick}
            >
                <div className={styles['portCard__icon']}>
                    <Settings />
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles['portCard']}
            onClick={handleCardClick}
        >
            <div className={styles['portCard__header']}>
                <div className={styles['portCard__title']}>
                    <h4 className={styles['portCard__name']} title={port.name}>
                        {port.name}
                    </h4>
                    {(onEdit || onDelete) && (
                        <div className={styles['portCard__actions']} onClick={(e) => e.stopPropagation()}>
                            {onEdit && (
                                <button
                                    className={styles['portCard__actionButton']}
                                    onClick={() => onEdit(port)}
                                    title="Редактировать"
                                >
                                    <Edit fontSize="small" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    className={styles['portCard__actionButton']}
                                    onClick={() => onDelete(port._id)}
                                    title="Удалить"
                                >
                                    <Delete fontSize="small" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles['portCard__info']}>
                <span className={styles['portCard__infoText']}>{getPortInfo()}</span>
            </div>
        </div>
    );
};

