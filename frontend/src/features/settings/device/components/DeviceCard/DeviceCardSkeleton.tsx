import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import styles from './DeviceCard.module.scss';

export const DeviceCardSkeleton = () => {
    return (
        <div className={styles['deviceCard']}>
            <div className={styles['deviceCard__header']}>
                <div className={styles['deviceCard__title']}>
                    <Skeleton variant="text" width="60%" height={24} className={styles['deviceCard__name']} />
                    <div className={styles['deviceCard__actions']}>
                        <Skeleton variant="circular" width={24} height={24} />
                    </div>
                </div>
            </div>
            <Skeleton variant="text" width="20%" height={24} className={styles['deviceCard__name']} />
        </div>
    );
};

