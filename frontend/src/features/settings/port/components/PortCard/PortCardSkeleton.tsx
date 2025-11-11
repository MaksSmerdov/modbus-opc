import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import styles from './PortCard.module.scss';

export const PortCardSkeleton = () => {
    return (
        <div className={styles['portCard']}>
            <div className={styles['portCard__header']}>
                <div className={styles['portCard__title']}>
                    <Skeleton variant="text" width="60%" height={24} className={styles['portCard__name']} />
                    <div className={styles['portCard__actions']}>
                        <Skeleton variant="circular" width={24} height={24} />
                    </div>
                </div>
            </div>
            <Skeleton variant="text" width="20%" height={24} className={styles['portCard__name']} />
        </div>
    );
};

