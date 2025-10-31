import { useState, type FormEvent } from 'react';
import { Button, Input, Select } from '@/shared/components';
import type { CreateRegisterTemplateDto, Register, DataType, FunctionCode, ByteOrder } from '../../types/config.types';
import styles from './TemplateForm.module.scss';

export interface TemplateFormProps {
  onSubmit: (data: CreateRegisterTemplateDto) => Promise<string>;
  onCancel?: () => void;
  loading?: boolean;
}

export function TemplateForm({ onSubmit, onCancel, loading = false }: TemplateFormProps) {
  const [formData, setFormData] = useState<CreateRegisterTemplateDto>({
    name: '',
    deviceType: '',
    registers: [],
  });

  const [currentRegister, setCurrentRegister] = useState<Partial<Register>>({
    name: '',
    address: 0,
    category: 'general',
    functionCode: 'holding',
    dataType: 'int16',
    bitIndex: null,
    byteOrder: 'ABCD',
    scale: 1,
    offset: 0,
    decimals: 0,
    unit: '',
    minValue: null,
    maxValue: null,
    description: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleAddRegister = () => {
    const length = getRegisterLength(currentRegister.dataType || 'int16');
    
    const newRegister: Register = {
      ...currentRegister,
      address: currentRegister.address || 0,
      length,
      name: currentRegister.name || '',
      category: currentRegister.category || 'general',
      functionCode: currentRegister.functionCode || 'holding',
      dataType: currentRegister.dataType || 'int16',
      bitIndex: currentRegister.bitIndex ?? null,
      byteOrder: currentRegister.byteOrder || 'ABCD',
      scale: currentRegister.scale || 1,
      offset: currentRegister.offset || 0,
      decimals: currentRegister.decimals || 0,
      unit: currentRegister.unit || '',
      minValue: currentRegister.minValue ?? null,
      maxValue: currentRegister.maxValue ?? null,
      description: currentRegister.description || '',
    };

    setFormData((prev) => ({
      ...prev,
      registers: [...prev.registers, newRegister],
    }));

    // Reset current register
    setCurrentRegister({
      name: '',
      address: (currentRegister.address || 0) + length,
      category: currentRegister.category,
      functionCode: currentRegister.functionCode,
      dataType: currentRegister.dataType,
      bitIndex: null,
      byteOrder: currentRegister.byteOrder,
      scale: 1,
      offset: 0,
      decimals: 0,
      unit: '',
      minValue: null,
      maxValue: null,
      description: '',
    });
  };

  const handleRemoveRegister = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      registers: prev.registers.filter((_, i) => i !== index),
    }));
  };

  const getRegisterLength = (dataType: DataType): number => {
    switch (dataType) {
      case 'int16':
      case 'uint16':
      case 'bits':
        return 1;
      case 'int32':
      case 'uint32':
      case 'float32':
        return 2;
      default:
        return 1;
    }
  };

  const isBitsType = currentRegister.dataType === 'bits';
  const isMultiRegisterType = ['int32', 'uint32', 'float32'].includes(currentRegister.dataType || '');

  return (
    <form className={styles['template-form']} onSubmit={handleSubmit}>
      <h2 className={styles['template-form__title']}>Создание шаблона регистров</h2>

      <div className={styles['template-form__header']}>
        <Input
          label="Название шаблона"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Например: boiler_template"
          required
          fullWidth
        />

        <Input
          label="Тип устройства"
          value={formData.deviceType}
          onChange={(e) => setFormData((prev) => ({ ...prev, deviceType: e.target.value }))}
          placeholder="boiler, deaerator..."
          required
          fullWidth
        />
      </div>

      <div className={styles['template-form__divider']} />

      <h3 className={styles['template-form__subtitle']}>Добавление регистров</h3>

      <div className={styles['template-form__register']}>
        <div className={styles['template-form__row']}>
          <Input
            label="Название регистра"
            value={currentRegister.name}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Температура"
            fullWidth
          />

          <Input
            label="Адрес"
            type="number"
            value={currentRegister.address}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, address: Number(e.target.value) }))}
            min={0}
            max={65535}
            fullWidth
          />
        </div>

        <div className={styles['template-form__row']}>
          <Select
            label="Функция Modbus"
            value={currentRegister.functionCode || 'holding'}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, functionCode: e.target.value as FunctionCode }))}
            options={[
              { value: 'holding', label: 'Holding Register' },
              { value: 'input', label: 'Input Register' },
              { value: 'coil', label: 'Coil' },
              { value: 'discrete', label: 'Discrete Input' },
            ]}
            fullWidth
          />

          <Select
            label="Тип данных"
            value={currentRegister.dataType || 'int16'}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, dataType: e.target.value as DataType }))}
            options={[
              { value: 'int16', label: 'Int16' },
              { value: 'uint16', label: 'UInt16' },
              { value: 'int32', label: 'Int32' },
              { value: 'uint32', label: 'UInt32' },
              { value: 'float32', label: 'Float32' },
              { value: 'bits', label: 'Bits (битовый)' },
            ]}
            fullWidth
          />

          {isBitsType && (
            <Input
              label="Индекс бита (0-15)"
              type="number"
              value={currentRegister.bitIndex ?? ''}
              onChange={(e) => setCurrentRegister((prev) => ({ ...prev, bitIndex: e.target.value ? Number(e.target.value) : null }))}
              min={0}
              max={15}
              fullWidth
            />
          )}
        </div>

        {isMultiRegisterType && (
          <div className={styles['template-form__row']}>
            <Select
              label="Порядок байтов"
              value={currentRegister.byteOrder || 'ABCD'}
              onChange={(e) => setCurrentRegister((prev) => ({ ...prev, byteOrder: e.target.value as ByteOrder }))}
              options={[
                { value: 'ABCD', label: 'ABCD (Big Endian)' },
                { value: 'CDAB', label: 'CDAB (Mid-Little Endian)' },
                { value: 'BADC', label: 'BADC (Mid-Big Endian)' },
                { value: 'DCBA', label: 'DCBA (Little Endian)' },
              ]}
              fullWidth
            />
          </div>
        )}

        <div className={styles['template-form__row']}>
          <Input
            label="Категория"
            value={currentRegister.category}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="parameters, alarms, info..."
            fullWidth
          />

          <Input
            label="Единица измерения"
            value={currentRegister.unit}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, unit: e.target.value }))}
            placeholder="°C, бар, мм..."
            fullWidth
          />

          <Input
            label="Округление"
            type="number"
            value={currentRegister.decimals}
            onChange={(e) => setCurrentRegister((prev) => ({ ...prev, decimals: Number(e.target.value) }))}
            min={0}
            max={10}
            fullWidth
          />
        </div>

        <Button type="button" variant="secondary" onClick={handleAddRegister} disabled={!currentRegister.name}>
          + Добавить регистр
        </Button>
      </div>

      {formData.registers.length > 0 && (
        <div className={styles['template-form__list']}>
          <h4 className={styles['template-form__list-title']}>Добавленные регистры ({formData.registers.length})</h4>
          <div className={styles['template-form__registers']}>
            {formData.registers.map((reg, index) => (
              <div key={index} className={styles['template-form__register-item']}>
                <div className={styles['template-form__register-info']}>
                  <strong>{reg.name}</strong>
                  <span>Адрес: {reg.address}, Тип: {reg.dataType}</span>
                  {reg.bitIndex !== null && <span>Бит: {reg.bitIndex}</span>}
                  {['int32', 'uint32', 'float32'].includes(reg.dataType) && <span>Байты: {reg.byteOrder}</span>}
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveRegister(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles['template-form__actions']}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} disabled={formData.registers.length === 0}>
          Создать шаблон
        </Button>
      </div>
    </form>
  );
}

