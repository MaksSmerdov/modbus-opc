import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/shared/components';
import type { CreateDeviceDto, Device } from '../../types/config.types';
import styles from './DeviceForm.module.scss';

export interface DeviceFormProps {
  portId: string;
  initialData?: Device;
  onSubmit: (data: CreateDeviceDto) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const DeviceForm = ({ 
  portId,
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: DeviceFormProps) => {
  
  const [formData, setFormData] = useState<CreateDeviceDto>({
    name: initialData?.name || '',
    slaveId: initialData?.slaveId || 1,
    portId: portId,
    saveInterval: initialData?.saveInterval || 5000,
    logData: initialData?.logData ?? true,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateDeviceDto, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form className={styles['device-form']} onSubmit={handleSubmit}>
      <Input
        label="Название устройства"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Например: Датчик температуры 1"
        required
        fullWidth
      />

      <Input
        label="Slave ID"
        type="number"
        value={formData.slaveId}
        onChange={(e) => handleChange('slaveId', Number(e.target.value))}
        min={1}
        max={247}
        required
        fullWidth
        helperText="Адрес устройства Modbus (1-247)"
      />

      <Input
        label="Интервал сохранения (мс)"
        type="number"
        value={formData.saveInterval}
        onChange={(e) => handleChange('saveInterval', Number(e.target.value))}
        min={1000}
        max={3600000}
        required
        fullWidth
        helperText="Как часто сохранять данные (1000-3600000 мс)"
      />

      <div className={styles['device-form__checkboxes']}>
        <label className={styles['device-form__checkbox']}>
          <input
            type="checkbox"
            checked={formData.logData}
            onChange={(e) => handleChange('logData', e.target.checked)}
          />
          <span>Записывать данные в лог</span>
        </label>

        <label 
          className={styles['device-form__checkbox']}
          title="Уровень 3: Управление опросом конкретного устройства"
        >
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          <span>📡 Включить опрос устройства (Уровень 3)</span>
        </label>
      </div>

      <div className={styles['device-form__actions']}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Сохранить изменения' : 'Добавить устройство'}
        </Button>
      </div>
    </form>
  );
};
