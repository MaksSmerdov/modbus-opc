import { useState, type FormEvent } from 'react';
import { Button, Input, Select } from '@/shared/components';
import type { CreateTagDto, Tag, UpdateTagDto } from '@/features/config/types/config.types';
import styles from './TagForm.module.scss';

export interface TagFormProps {
  initialData?: Tag;
  onSubmit: (data: CreateTagDto | UpdateTagDto) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const TagForm = ({ initialData, onSubmit, onCancel, loading = false }: TagFormProps) => {
  const [formData, setFormData] = useState<CreateTagDto>({
    name: initialData?.name || '',
    address: initialData?.address ?? 0,
    length: initialData?.length ?? 1,
    category: initialData?.category || 'general',
    functionCode: initialData?.functionCode || 'holding',
    dataType: initialData?.dataType || 'uint16',
    bitIndex: initialData?.bitIndex ?? null,
    byteOrder: initialData?.byteOrder || 'ABCD',
    scale: initialData?.scale ?? 1,
    offset: initialData?.offset ?? 0,
    decimals: initialData?.decimals ?? 0,
    unit: initialData?.unit || '',
    minValue: initialData?.minValue ?? null,
    maxValue: initialData?.maxValue ?? null,
    description: initialData?.description || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateTagDto, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form className={styles['tag-form']} onSubmit={handleSubmit}>
      <div className={styles['tag-form__grid']}>
        <Input
          label="Название тэга"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Temperature"
          required
          fullWidth
        />

        <Input
          label="Адрес"
          type="number"
          value={formData.address}
          onChange={(e) => handleChange('address', Number(e.target.value))}
          min={0}
          max={65535}
          required
          fullWidth
        />

        <Input
          label="Длина (регистров)"
          type="number"
          value={formData.length}
          onChange={(e) => handleChange('length', Number(e.target.value))}
          min={1}
          max={125}
          required
          fullWidth
        />

        <Select
          label="Функция Modbus"
          value={formData.functionCode}
          onChange={(e) => handleChange('functionCode', e.target.value)}
          options={[
            { value: 'holding', label: 'Holding Register (FC03)' },
            { value: 'input', label: 'Input Register (FC04)' },
            { value: 'coil', label: 'Coil (FC01)' },
            { value: 'discrete', label: 'Discrete Input (FC02)' },
          ]}
          required
          fullWidth
        />

        <Select
          label="Тип данных"
          value={formData.dataType}
          onChange={(e) => handleChange('dataType', e.target.value)}
          options={[
            { value: 'int16', label: 'Int16' },
            { value: 'uint16', label: 'UInt16' },
            { value: 'int32', label: 'Int32' },
            { value: 'uint32', label: 'UInt32' },
            { value: 'float32', label: 'Float32' },
            { value: 'string', label: 'String' },
            { value: 'bits', label: 'Bits' },
          ]}
          required
          fullWidth
        />

        <Input
          label="Категория"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="general"
          fullWidth
        />

        {formData.dataType === 'bits' && (
          <Input
            label="Индекс бита"
            type="number"
            value={formData.bitIndex ?? ''}
            onChange={(e) => handleChange('bitIndex', e.target.value ? Number(e.target.value) : null)}
            min={0}
            max={15}
            fullWidth
          />
        )}

        {['int32', 'uint32', 'float32'].includes(formData.dataType) && (
          <Select
            label="Порядок байтов"
            value={formData.byteOrder}
            onChange={(e) => handleChange('byteOrder', e.target.value)}
            options={[
              { value: 'ABCD', label: 'ABCD (Big Endian)' },
              { value: 'CDAB', label: 'CDAB (Little Endian)' },
              { value: 'BADC', label: 'BADC' },
              { value: 'DCBA', label: 'DCBA' },
            ]}
            fullWidth
          />
        )}

        <Input
          label="Масштаб"
          type="number"
          value={formData.scale}
          onChange={(e) => handleChange('scale', Number(e.target.value))}
          step="0.01"
          fullWidth
        />

        <Input
          label="Смещение"
          type="number"
          value={formData.offset}
          onChange={(e) => handleChange('offset', Number(e.target.value))}
          step="0.01"
          fullWidth
        />

        <Input
          label="Знаков после запятой"
          type="number"
          value={formData.decimals}
          onChange={(e) => handleChange('decimals', Number(e.target.value))}
          min={0}
          max={10}
          fullWidth
        />

        <Input
          label="Единица измерения"
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          placeholder="°C, bar, %"
          fullWidth
        />

        <Input
          label="Мин. значение"
          type="number"
          value={formData.minValue ?? ''}
          onChange={(e) => handleChange('minValue', e.target.value ? Number(e.target.value) : null)}
          step="0.01"
          fullWidth
        />

        <Input
          label="Макс. значение"
          type="number"
          value={formData.maxValue ?? ''}
          onChange={(e) => handleChange('maxValue', e.target.value ? Number(e.target.value) : null)}
          step="0.01"
          fullWidth
        />
      </div>

      <Input
        label="Описание"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Описание тэга"
        fullWidth
      />

      <div className={styles['tag-form__actions']}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Сохранить изменения' : 'Добавить тэг'}
        </Button>
      </div>
    </form>
  );
};

