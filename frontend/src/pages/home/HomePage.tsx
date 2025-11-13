import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks/hooks';
import { Button } from '@/shared/ui/Button/Button';
import styles from './HomePage.module.scss';

export const HomePage = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    const userName = useMemo(() => {
        if (isAuthenticated && user?.name) {
            return user.name;
        }
        return 'пользователь';
    }, [isAuthenticated, user?.name]);

    const content = useMemo(() => {
        const baseText = `${userName}, добро пожаловать в систему мониторинга и управления Modbus устройствами.`;

        if (!isAuthenticated || !user) {
            return {
                greeting: baseText,
                description: 'Система Modbus OPC Server предоставляет возможность мониторинга и управления Modbus устройствами в режиме реального времени.',
                capabilities: [
                    'Просмотр данных мониторинга всех устройств',
                    'Отслеживание текущих значений тегов',
                    'Просмотр статуса работы портов и устройств',
                ],
            };
        }

        switch (user.role) {
            case 'admin':
                return {
                    greeting: baseText,
                    description: 'Как администратор, вы имеете полный доступ ко всем функциям системы управления Modbus устройствами.',
                    capabilities: [
                        'Управление портами подключения (создание, редактирование, удаление)',
                        'Управление устройствами (настройка параметров, включение/выключение)',
                        'Настройка тегов для каждого устройства (адреса, типы данных, масштабирование)',
                        'Мониторинг данных в режиме реального времени',
                        'Управление пользователями системы (создание, изменение ролей, удаление)',
                        'Настройка системы опроса устройств (запуск/остановка, интервал опроса)',
                        'Просмотр истории изменений и логов',
                        'Настройка параметров системы',
                    ],
                };
            case 'operator':
                return {
                    greeting: baseText,
                    description: 'Как оператор, вы можете управлять конфигурацией системы и мониторить данные устройств.',
                    capabilities: [
                        'Управление портами подключения (создание, редактирование, удаление)',
                        'Управление устройствами (настройка параметров, включение/выключение)',
                        'Настройка тегов для каждого устройства (адреса, типы данных, масштабирование)',
                        'Мониторинг данных в режиме реального времени',
                        'Управление системой опроса устройств (запуск/остановка, интервал опроса)',
                        'Просмотр статуса работы портов и устройств',
                    ],
                };
            case 'viewer':
                return {
                    greeting: baseText,
                    description: 'Вам доступен просмотр данных мониторинга и конфигурации системы. Чтобы получить больше возможностей обратитесь к администратору.',
                    capabilities: [
                        'Мониторинг данных в режиме реального времени',
                        'Просмотр текущих значений всех тегов',
                        'Отслеживание статуса работы системы опроса',
                    ],
                };
            default:
                return {
                    greeting: baseText,
                    description: 'В данном приложении доступны следующие опции.',
                    capabilities: [],
                };
        }
    }, [userName, isAuthenticated, user?.role]);

    return (
        <div className={`${styles['homePage']} page`}>
            <div className={styles['homePage__content']}>
                <h1 className={`${styles['homePage__title']} title-reset`}>Добро пожаловать в Modbus OPC</h1>
                <p className={styles['homePage__greeting']}>
                    {content.greeting}
                </p>
                <p className={styles['homePage__description']}>
                    {content.description}
                </p>
                {content.capabilities.length > 0 && (
                    <div className={styles['homePage__capabilities']}>
                        <h2 className={styles['homePage__capabilitiesTitle']}>Доступные возможности:</h2>
                        <ul className={styles['homePage__capabilitiesList']}>
                            {content.capabilities.map((capability, index) => (
                                <li key={index} className={styles['homePage__capabilityItem']}>
                                    {capability}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <Button className={styles['homePage__monitorButton']}>Перейти к панели мониторинга</Button>
            </div>
        </div>
    );
};
