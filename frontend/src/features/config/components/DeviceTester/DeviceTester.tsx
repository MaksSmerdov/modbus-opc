import { useState, useEffect } from 'react';
import { Select } from '@/shared/components';
import { useGetDevicesQuery } from '../../api/devicesApi';
import { useGetAllDevicesDataQuery } from '@/features/data/api';
import { useUpdateRegisterMutation } from '../../api/templatesApi';
import type { ByteOrder } from '../../types/config.types';
import styles from './DeviceTester.module.scss';

export function DeviceTester() {
  const { data: devicesResponse, isLoading: devicesLoading } = useGetDevicesQuery();
  const { data: devicesDataResponse, isLoading: dataLoading, refetch } = useGetAllDevicesDataQuery(undefined, {
    pollingInterval: 2000, // Обновляем каждые 2 секунды
  });
  const [updateRegister, { isLoading: isUpdating }] = useUpdateRegisterMutation();
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const devices = devicesResponse?.data || [];
  const devicesData = devicesDataResponse || [];

  // Автоматически выбираем первое устройство
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]._id);
    }
  }, [devices, selectedDevice]);

  const currentDevice = devices.find(d => d._id === selectedDevice);
  const currentDeviceData = devicesData.find(d => d.name === currentDevice?.name);

  // Получаем все регистры
  const allRegisters = currentDevice?.registerTemplateId && 
    typeof currentDevice.registerTemplateId !== 'string' &&
    currentDevice.registerTemplateId.registers
    ? currentDevice.registerTemplateId.registers
    : [];

  const handleRegisterUpdate = async (registerIndex: number, updates: Record<string, unknown>) => {
    if (!currentDevice?.registerTemplateId || typeof currentDevice.registerTemplateId === 'string') {
      return;
    }

    try {
      await updateRegister({
        templateId: currentDevice.registerTemplateId._id,
        registerIndex,
        data: updates
      }).unwrap();

      // Обновляем данные после изменения
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error) {
      console.error('Ошибка обновления регистра:', error);
      alert('Не удалось обновить регистр');
    }
  };

  if (devicesLoading || dataLoading) {
    return <div className={styles['device-tester']}>Загрузка...</div>;
  }

  if (devices.length === 0) {
    return (
      <div className={styles['device-tester']}>
        <p className={styles['device-tester__empty']}>
          Нет настроенных устройств. Создайте устройство через мастер настройки.
        </p>
      </div>
    );
  }

  return (
    <div className={styles['device-tester']}>
      <div className={styles['device-tester__header']}>
        <h2 className={styles['device-tester__title']}>Тестирование и настройка регистров</h2>
        <p className={styles['device-tester__description']}>
          Выберите устройство и настройте порядок байтов для регистров. Изменения применяются в реальном времени.
        </p>
      </div>

      <div className={styles['device-tester__device-selector']}>
        <Select
          label="Выберите устройство"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          options={devices.map(device => ({
            value: device._id,
            label: `${device.name} (Slave ID: ${device.slaveId})`
          }))}
          fullWidth
        />
      </div>

      {currentDevice && (
        <div className={styles['device-tester__content']}>
          <div className={styles['device-tester__info']}>
            <div className={styles['device-tester__info-item']}>
              <span className={styles['device-tester__info-label']}>Статус:</span>
              <span className={`${styles['device-tester__info-value']} ${currentDeviceData?.isResponding ? styles['device-tester__info-value--online'] : styles['device-tester__info-value--offline']}`}>
                {currentDeviceData?.isResponding ? '🟢 Онлайн' : '🔴 Оффлайн'}
              </span>
            </div>
            {currentDeviceData?.lastUpdated && (
              <div className={styles['device-tester__info-item']}>
                <span className={styles['device-tester__info-label']}>Последнее обновление:</span>
                <span className={styles['device-tester__info-value']}>
                  {new Date(currentDeviceData.lastUpdated).toLocaleTimeString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          {allRegisters.length === 0 ? (
            <div className={styles['device-tester__empty']}>
              <p>Нет регистров для настройки.</p>
            </div>
          ) : (
            <div className={styles['device-tester__registers']}>
              <h3 className={styles['device-tester__registers-title']}>
                Регистры ({allRegisters.length})
              </h3>
              
              {allRegisters.map((register, idx) => {
                const registerData = currentDeviceData?.data?.[register.category]?.[register.name];
                const actualIndex = currentDevice.registerTemplateId && 
                  typeof currentDevice.registerTemplateId !== 'string' &&
                  currentDevice.registerTemplateId.registers
                  ? currentDevice.registerTemplateId.registers.findIndex(r => r.name === register.name)
                  : -1;

                const isMultiRegister = ['int32', 'uint32', 'float32'].includes(register.dataType);
                const isBitsType = register.dataType === 'bits';
                const isNumericType = !isBitsType && register.dataType !== 'string';

                return (
                  <div key={idx} className={styles['device-tester__register']}>
                    <div className={styles['device-tester__register-header']}>
                      <div className={styles['device-tester__register-info']}>
                        <h4 className={styles['device-tester__register-name']}>
                          {register.name}
                          {register.category && (
                            <span className={styles['device-tester__register-category']}>
                              {register.category}
                            </span>
                          )}
                        </h4>
                        <span className={styles['device-tester__register-meta']}>
                          Адрес: {register.address} | Тип: {register.dataType}
                          {isBitsType && register.bitIndex !== null && ` | Бит: ${register.bitIndex}`}
                        </span>
                      </div>
                      
                      <div className={styles['device-tester__register-value']}>
                        {registerData ? (
                          <span className={styles['device-tester__value']}>
                            {typeof registerData.value === 'number' 
                              ? registerData.value.toFixed(register.decimals || 0)
                              : String(registerData.value)
                            }
                            {registerData.unit && ` ${registerData.unit}`}
                          </span>
                        ) : (
                          <span className={styles['device-tester__value--empty']}>—</span>
                        )}
                      </div>
                    </div>

                    <div className={styles['device-tester__register-controls']}>
                      <div className={styles['device-tester__controls-row']}>
                        {isMultiRegister && (
                          <div className={styles['device-tester__control']}>
                            <Select
                              label="Порядок байтов"
                              value={register.byteOrder}
                              onChange={(e) => handleRegisterUpdate(actualIndex, { byteOrder: e.target.value as ByteOrder })}
                              disabled={isUpdating}
                              options={[
                                { value: 'ABCD', label: 'ABCD (Big Endian)' },
                                { value: 'CDAB', label: 'CDAB (Mid-LE)' },
                                { value: 'BADC', label: 'BADC (Mid-BE)' },
                                { value: 'DCBA', label: 'DCBA (Little Endian)' },
                              ]}
                              fullWidth
                            />
                          </div>
                        )}
                        
                        {isNumericType && (
                          <>
                            <div className={styles['device-tester__control']}>
                              <label className={styles['device-tester__label']}>
                                Масштаб (scale)
                                <input
                                  type="number"
                                  step="0.1"
                                  value={register.scale}
                                  onChange={(e) => handleRegisterUpdate(actualIndex, { scale: parseFloat(e.target.value) || 1 })}
                                  disabled={isUpdating}
                                  className={styles['device-tester__input']}
                                />
                              </label>
                            </div>
                            
                            <div className={styles['device-tester__control']}>
                              <label className={styles['device-tester__label']}>
                                Округление (decimals)
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={register.decimals}
                                  onChange={(e) => handleRegisterUpdate(actualIndex, { decimals: parseInt(e.target.value) || 0 })}
                                  disabled={isUpdating}
                                  className={styles['device-tester__input']}
                                />
                              </label>
                            </div>

                            <div className={styles['device-tester__control']}>
                              <label className={styles['device-tester__label']}>
                                Единица измерения
                                <input
                                  type="text"
                                  value={register.unit}
                                  onChange={(e) => handleRegisterUpdate(actualIndex, { unit: e.target.value })}
                                  disabled={isUpdating}
                                  placeholder="°C, бар, мм..."
                                  className={styles['device-tester__input']}
                                />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {register.description && (
                        <div className={styles['device-tester__register-hint']}>
                          {register.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

