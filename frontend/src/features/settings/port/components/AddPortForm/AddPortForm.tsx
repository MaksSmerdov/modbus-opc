import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Select } from '@/shared/ui/Select/Select';
import { MenuItem } from '@mui/material';
import type { CreatePortData, ConnectionType } from '../../types';
import { portSchema, type PortFormData } from './portSchemas';
import {
    getDefaultPortFormValues,
    getRTUResetValues,
    getTCPResetValues,
} from './utils/formUtils';
import { RTUFields } from './fields/RTUFields';
import { TCPFields } from './fields/TCPFields';
import styles from './AddPortForm.module.scss';

interface AddPortFormProps {
    onSubmit: (data: CreatePortData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: CreatePortData;
    mode?: 'create' | 'edit';
}

export const AddPortForm = ({
    onSubmit,
    onCancel,
    isLoading = false,
    initialData,
    mode = 'create',
}: AddPortFormProps) => {
    const [connectionType, setConnectionType] = useState<ConnectionType>(
        initialData?.connectionType || 'RTU'
    );

    const methods = useForm<PortFormData>({
        resolver: zodResolver(portSchema),
        defaultValues: getDefaultPortFormValues(initialData),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = methods;

    const watchedConnectionType = watch('connectionType');

    // Обновляем форму при изменении initialData
    useEffect(() => {
        const defaultValues = getDefaultPortFormValues(initialData);
        reset(defaultValues);
        setConnectionType(defaultValues.connectionType || 'RTU');
    }, [initialData, reset]);

    const handleConnectionTypeChange = (newType: ConnectionType) => {
        setConnectionType(newType);
        setValue('connectionType', newType);
        if (newType === 'RTU') {
            reset(getRTUResetValues());
        } else {
            reset(getTCPResetValues());
        }
    };

    const onFormSubmit = (data: PortFormData) => {
        onSubmit(data as CreatePortData);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onFormSubmit)} className={styles['form']}>
                <div className={styles['form__header']}>
                    <Select
                        value={connectionType}
                        onChange={(e) => handleConnectionTypeChange(e.target.value as ConnectionType)}
                        label="Тип подключения"
                        error={!!errors.connectionType}
                        helperText={errors.connectionType?.message || 'Выберите тип'}
                        disabled={isLoading}
                    >
                        <MenuItem value="RTU">RTU</MenuItem>
                        <MenuItem value="TCP">TCP</MenuItem>
                    </Select>

                    <Input
                        label="Название порта"
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message || 'Например: "Котельная (к.265)" или "MOXA 169.254.x.xxx"'}
                        disabled={isLoading}
                    />
                </div>

                {watchedConnectionType === 'RTU' ? (
                    <RTUFields
                        isLoading={isLoading}
                        errors={errors}
                        watchedConnectionType={watchedConnectionType}
                    />
                ) : (
                    <TCPFields
                        isLoading={isLoading}
                        errors={errors}
                        watchedConnectionType={watchedConnectionType}
                    />
                )}

                <div className={styles['form__actions']}>
                    <Button variant="outlined" onClick={onCancel} disabled={isLoading} fullWidth>
                        Отмена
                    </Button>
                    <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
                        {isLoading
                            ? (mode === 'edit' ? 'Сохранение...' : 'Создание...')
                            : (mode === 'edit' ? 'Сохранить изменения' : 'Создать порт')
                        }
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

