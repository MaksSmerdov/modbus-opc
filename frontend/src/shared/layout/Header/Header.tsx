import { PollingToggle } from '@/features/polling/components';
import styles from './Header.module.scss';

const Header = () => {
    return (
        <header className={`${styles['header']}`}>
            <div className={`${styles['header__container']}`}>
                <div className={`${styles['header__left']}`}>
                    <h1 className={`${styles['header__title']}`}>
                        Modbus OPC
                    </h1>
                </div>
                <div className={`${styles['header__right']}`}>
                    <PollingToggle />
                </div>
            </div>
        </header>
    )
}

export default Header;