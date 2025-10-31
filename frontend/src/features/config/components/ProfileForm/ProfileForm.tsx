import { useState, type FormEvent } from 'react';
import { Button, Input, Select } from '@/shared/components';
import type { CreateConnectionProfileDto, ConnectionType } from '../../types/config.types';
import styles from './ProfileForm.module.scss';

export interface ProfileFormProps {
  onSubmit: (data: CreateConnectionProfileDto) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ProfileForm({ onSubmit, onCancel, loading = false }: ProfileFormProps) {
  const [connectionType, setConnectionType] = useState<ConnectionType>('RTU');
  const [formData, setFormData] = useState<CreateConnectionProfileDto>({
    name: '',
    connectionType: 'RTU',
    // RTU defaults
    port: 'COM1',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    // TCP defaults
    host: '',
    tcpPort: 502,
    // Common
    timeout: 500,
    retries: 3,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConnectionTypeChange = (value: string) => {
    const newType = value as ConnectionType;
    setConnectionType(newType);
    setFormData((prev) => ({
      ...prev,
      connectionType: newType,
    }));
  };

  return (
    <form className={styles['profile-form']} onSubmit={handleSubmit}>
      <h2 className={styles['profile-form__title']}>Создание профиля подключения</h2>

      <Input
        label="Название профиля"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Например: k265_COM16"
        required
        fullWidth
      />

      <Select
        label="Тип подключения"
        value={connectionType}
        onChange={(e) => handleConnectionTypeChange(e.target.value)}
        options={[
          { value: 'RTU', label: 'RTU (RS-485/RS-232)' },
          { value: 'TCP', label: 'TCP (Ethernet)' },
        ]}
        required
        fullWidth
      />

      {connectionType === 'RTU' ? (
        <>
          <Input
            label="COM-порт"
            value={formData.port || ''}
            onChange={(e) => handleChange('port', e.target.value)}
            placeholder="COM1, COM2, COM16..."
            required
            fullWidth
          />

          <Select
            label="Скорость (baud rate)"
            value={formData.baudRate || 9600}
            onChange={(e) => handleChange('baudRate', Number(e.target.value))}
            options={[
              { value: 9600, label: '9600' },
              { value: 19200, label: '19200' },
              { value: 38400, label: '38400' },
              { value: 57600, label: '57600' },
              { value: 115200, label: '115200' },
            ]}
            required
            fullWidth
          />

          <div className={styles['profile-form__row']}>
            <Select
              label="Биты данных"
              value={formData.dataBits || 8}
              onChange={(e) => handleChange('dataBits', Number(e.target.value))}
              options={[
                { value: 7, label: '7' },
                { value: 8, label: '8' },
              ]}
              fullWidth
            />

            <Select
              label="Стоп-биты"
              value={formData.stopBits || 1}
              onChange={(e) => handleChange('stopBits', Number(e.target.value))}
              options={[
                { value: 1, label: '1' },
                { value: 2, label: '2' },
              ]}
              fullWidth
            />

            <Select
              label="Четность"
              value={formData.parity || 'none'}
              onChange={(e) => handleChange('parity', e.target.value)}
              options={[
                { value: 'none', label: 'Нет' },
                { value: 'even', label: 'Четная' },
                { value: 'odd', label: 'Нечетная' },
              ]}
              fullWidth
            />
          </div>
        </>
      ) : (
        <>
          <Input
            label="IP-адрес или хост"
            value={formData.host || ''}
            onChange={(e) => handleChange('host', e.target.value)}
            placeholder="192.168.1.100 или localhost"
            required
            fullWidth
          />

          <Input
            label="TCP порт"
            type="number"
            value={formData.tcpPort || 502}
            onChange={(e) => handleChange('tcpPort', Number(e.target.value))}
            placeholder="502"
            required
            fullWidth
          />
        </>
      )}

      <div className={styles['profile-form__row']}>
        <Input
          label="Timeout (мс)"
          type="number"
          value={formData.timeout}
          onChange={(e) => handleChange('timeout', Number(e.target.value))}
          min={100}
          max={10000}
          fullWidth
        />

        <Input
          label="Попытки повтора"
          type="number"
          value={formData.retries}
          onChange={(e) => handleChange('retries', Number(e.target.value))}
          min={1}
          max={10}
          fullWidth
        />
      </div>

      <div className={styles['profile-form__actions']}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Создать профиль
        </Button>
      </div>
    </form>
  );
}

