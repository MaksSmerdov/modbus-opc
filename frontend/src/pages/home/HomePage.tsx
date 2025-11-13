import styles from './HomePage.module.scss';

export const HomePage = () => {
    return (
        <div className={`${styles['homePage']} page`}>
            <div className={styles['homePage__content']}>
                <h1 className={styles['homePage__title']}>Добро пожаловать в Modbus OPC</h1>
                <p className={styles['homePage__description']}>
                    Система мониторинга и управления Modbus устройствами
                </p>
            </div>
        </div>
    );
};
