import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/shared/components';
import type { CreateDeviceDto } from '../../types/config.types';
import styles from './DeviceForm.module.scss';

export interface DeviceFormProps {
  profileId: string;
  templateId: string;
  onSubmit: (data: CreateDeviceDto) => void;
  onBack?: () => void;
  loading?: boolean;
}

export function DeviceForm({ profileId, templateId, onSubmit, onBack, loading = false }: DeviceFormProps) {
  const [formData, setFormData] = useState<CreateDeviceDto>({
    name: '',
    slaveId: 1,
    connectionProfileId: profileId,
    registerTemplateId: templateId,
    saveInterval: 30000,
    logData: false,
    isActive: true,
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
      <h2 className={styles['device-form__title']}>Создание устройства</h2>

      <Input
        label="Название устройства"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Например: boiler1, deaerator"
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
      />

      <Input
        label="Интервал сохранения (мс)"
        type="number"
        value={formData.saveInterval}
        onChange={(e) => handleChange('saveInterval', Number(e.target.value))}
        min={5000}
        placeholder="30000"
        fullWidth
      />

      <div className={styles['device-form__checkboxes']}>
        <label className={styles['device-form__checkbox']}>
          <input
            type="checkbox"
            checked={formData.logData}
            onChange={(e) => handleChange('logData', e.target.checked)}
          />
          <span>Отображать данные в консоли</span>
        </label>

        <label className={styles['device-form__checkbox']}>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          <span>Активировать устройство</span>
        </label>
      </div>

      <div className={styles['device-form__actions']}>
        {onBack && (
          <Button type="button" variant="secondary" onClick={onBack}>
            Назад
          </Button>
        )}
        <Button type="submit" variant="success" loading={loading}>
          Завершить
        </Button>
      </div>
    </form>
  );
}

