import { useGetAllDevicesDataQuery } from '@/features/data/api';
import styles from './Header.module.scss';

const Header = () => {
    const { data } = useGetAllDevicesDataQuery();

    return (
        <header className={`${styles['header']}`}>
            <div className={`${styles['header__container']}`}>
                <div className={`${styles['header__left']}`}>
                    <h1 className={`${styles['header__title']}`}>
                        Modbus OPC
                    </h1>
                </div>
                <div className={`${styles['header__right']}`}>
                    {data?.map((device) => (
                        <div key={device.name}>
                            {device.name}
                        </div>
                    ))}
                </div>
            </div>
        </header>
    )
}

export default Header;