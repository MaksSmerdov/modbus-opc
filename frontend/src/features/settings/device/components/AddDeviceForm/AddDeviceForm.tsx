import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { useAppSelector } from '@/app/hooks/hooks';
import type { CreateDeviceData } from '@/features/settings/device/types';
import { deviceSchema, type DeviceFormData } from './deviceSchemas';
import { getDefaultDeviceFormValues, generateSlugFromName, getSlugHelperText } from './utils/formUtils';
import styles from './AddDeviceForm.module.scss';

interface AddDeviceFormProps {
  onSubmit: (data: CreateDeviceData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  portId: string;
  initialData?: CreateDeviceData;
  mode?: 'create' | 'edit';
}

export const AddDeviceForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  portId,
  initialData,
  mode = 'create',
}: AddDeviceFormProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    control,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: getDefaultDeviceFormValues(portId, initialData),
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');
  const slugWasManuallyEdited = useRef(false);

  // Автогенерация slug из названия
  useEffect(() => {
    if (!initialData?.slug && mode === 'create' && watchedName) {
      // Генерируем slug только если он не был изменен вручную
      if (!slugWasManuallyEdited.current) {
        const generatedSlug = generateSlugFromName(watchedName);
        setValue('slug', generatedSlug, { shouldValidate: false, shouldDirty: false });
      }
    }
  }, [watchedName, initialData?.slug, mode, setValue]);

  // Сбрасываем флаг ручного редактирования при размонтировании или изменении режима
  useEffect(() => {
    if (mode === 'create' && !initialData?.slug) {
      slugWasManuallyEdited.current = false;
    }
  }, [mode, initialData?.slug]);

  const onFormSubmit = (data: DeviceFormData) => {
    onSubmit(data as CreateDeviceData);
  };

  const slugHelperText = getSlugHelperText(watchedSlug, !!errors.slug, errors.slug?.message, isAdmin);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles['form']}>
      <Input
        label="Название устройства"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message || 'Например: "Объект №1"'}
        disabled={isLoading}
      />

      {isAdmin && (
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <Input
              label="Slug (опционально)"
              {...field}
              onChange={(e) => {
                slugWasManuallyEdited.current = true;
                field.onChange(e);
              }}
              error={!!errors.slug}
              helperText={slugHelperText}
              disabled={isLoading}
            />
          )}
        />
      )}

      <Input
        label="Slave ID"
        type="number"
        {...register('slaveId', { valueAsNumber: true })}
        error={!!errors.slaveId}
        helperText={errors.slaveId?.message || 'Адрес устройства'}
        disabled={isLoading}
      />

      <div className={styles['form__row']}>
        <Input
          label="Таймаут (мс)"
          type="number"
          {...register('timeout', { valueAsNumber: true })}
          error={!!errors.timeout}
          helperText={errors.timeout?.message || 'Макс. время ожидания от устройства'}
          disabled={isLoading}
        />

        <Input
          label="Повторы"
          type="number"
          {...register('retries', { valueAsNumber: true })}
          error={!!errors.retries}
          helperText={errors.retries?.message || 'Кол-во повторов при ошибке связи'}
          disabled={isLoading}
        />
      </div>

      <Input
        label="Интервал сохранения (мс)"
        type="number"
        {...register('saveInterval', { valueAsNumber: true })}
        error={!!errors.saveInterval}
        helperText={errors.saveInterval?.message || 'Периодичность сохранения в базу данных'}
        disabled={isLoading}
      />

      <div className={styles['form__actions']}>
        <Button variant="outlined" onClick={onCancel} disabled={isLoading} fullWidth>
          Отмена
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading || (mode === 'edit' && !isDirty)} fullWidth>
          {isLoading
            ? mode === 'edit'
              ? 'Сохранение...'
              : 'Создание...'
            : mode === 'edit'
            ? 'Сохранить изменения'
            : 'Создать устройство'}
        </Button>
      </div>
    </form>
  );
};
