import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { transliterate } from '@/shared/utils/transliterate';
import { useAppSelector } from '@/app/hooks/hooks';
import type { CreateDeviceData } from '../../types';
import { deviceSchema, type DeviceFormData } from './deviceSchemas';
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
        formState: { errors },
        watch,
        setValue,
    } = useForm<DeviceFormData>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            slaveId: initialData?.slaveId || 1,
            portId: portId,
            timeout: initialData?.timeout || 500,
            retries: initialData?.retries || 3,
            saveInterval: initialData?.saveInterval || 30000,
            logData: initialData?.logData || false,
            isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
        },
    });

    const watchedSlug = watch('slug');

    // Автогенерация slug из названия
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (!initialData?.slug && mode === 'create' && !isAdmin) {
            // Автогенерация только для не-админов
            const generatedSlug = transliterate(name).toLowerCase().replace(/[^a-z0-9-_]/g, '-');
            setValue('slug', generatedSlug, { shouldValidate: false });
        }
    };

    const onFormSubmit = (data: DeviceFormData) => {
        onSubmit(data as CreateDeviceData);
    };

    // Определяем helperText для slug
    const getSlugHelperText = () => {
        if (errors.slug?.message) {
            return errors.slug.message;
        }
        if (watchedSlug) {
            return undefined; // Скрываем helperText когда slug заполнен
        }
        if (isAdmin) {
            return 'Опционально. Если не указан, будет сгенерирован автоматически';
        }
        return undefined; // Для не-админов поле скрыто, поэтому helperText не нужен
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className={styles['form']}>
            <Input
                label="Название устройства"
                {...register('name', { onChange: handleNameChange })}
                error={!!errors.name}
                helperText={errors.name?.message || 'Например: "Датчик температуры №1"'}
                disabled={isLoading}
            />

            {isAdmin && (
                <Input
                    label="Slug (опционально)"
                    {...register('slug')}
                    error={!!errors.slug}
                    helperText={getSlugHelperText()}
                    disabled={isLoading}
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
                    helperText={errors.timeout?.message || 'По умолчанию: 500'}
                    disabled={isLoading}
                />

                <Input
                    label="Повторы"
                    type="number"
                    {...register('retries', { valueAsNumber: true })}
                    error={!!errors.retries}
                    helperText={errors.retries?.message || 'По умолчанию: 3'}
                    disabled={isLoading}
                />
            </div>

            <Input
                label="Интервал сохранения (мс)"
                type="number"
                {...register('saveInterval', { valueAsNumber: true })}
                error={!!errors.saveInterval}
                helperText={errors.saveInterval?.message || 'По умолчанию: 30000'}
                disabled={isLoading}
            />

            <div className={styles['form__actions']}>
                <Button variant="outlined" onClick={onCancel} disabled={isLoading} fullWidth>
                    Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
                    {isLoading
                        ? (mode === 'edit' ? 'Сохранение...' : 'Создание...')
                        : (mode === 'edit' ? 'Сохранить изменения' : 'Создать устройство')
                    }
                </Button>
            </div>
        </form>
    );
};
