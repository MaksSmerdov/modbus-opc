import { useState, useEffect } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Select } from '@/shared/ui/Select/Select';
import { MenuItem } from '@mui/material';
import type { CreatePortData, ConnectionType } from '../../types';
import { portSchema, type PortFormData, rtuPortSchema, tcpPortSchema } from './portSchemas';
import type { z } from 'zod';
import styles from './AddPortForm.module.scss';

// Типы для ошибок RTU и TCP портов
type RTUFormData = z.infer<typeof rtuPortSchema>;
type TCPFormData = z.infer<typeof tcpPortSchema>;
type RTUFieldErrors = FieldErrors<RTUFormData>;
type TCPFieldErrors = FieldErrors<TCPFormData>;

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

    const getDefaultValues = (): Partial<PortFormData> => {
        if (initialData) {
            if (initialData.connectionType === 'RTU') {
                return {
                    connectionType: 'RTU',
                    name: initialData.name,
                    port: initialData.port,
                    baudRate: initialData.baudRate || 9600,
                    dataBits: initialData.dataBits || 8,
                    stopBits: initialData.stopBits || 1,
                    parity: initialData.parity || 'none',
                    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                };
            } else {
                return {
                    connectionType: 'TCP',
                    name: initialData.name,
                    host: initialData.host,
                    tcpPort: initialData.tcpPort,
                    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                };
            }
        }
        return {
            connectionType: 'RTU',
            isActive: true,
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        };
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<PortFormData>({
        resolver: zodResolver(portSchema),
        defaultValues: getDefaultValues(),
    });

    const watchedConnectionType = watch('connectionType');

    // Обновляем форму при изменении initialData
    useEffect(() => {
        if (initialData) {
            if (initialData.connectionType === 'RTU') {
                const defaultValues = {
                    connectionType: 'RTU' as const,
                    name: initialData.name,
                    port: initialData.port,
                    baudRate: initialData.baudRate || 9600,
                    dataBits: initialData.dataBits || 8,
                    stopBits: initialData.stopBits || 1,
                    parity: (initialData.parity || 'none') as 'none' | 'even' | 'odd',
                    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                };
                reset(defaultValues);
                setConnectionType('RTU');
            } else {
                const defaultValues = {
                    connectionType: 'TCP' as const,
                    name: initialData.name,
                    host: initialData.host,
                    tcpPort: initialData.tcpPort,
                    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                };
                reset(defaultValues);
                setConnectionType('TCP');
            }
        } else {
            reset({
                connectionType: 'RTU',
                isActive: true,
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
            });
            setConnectionType('RTU');
        }
    }, [initialData, reset]);

    // Helper функции для безопасного доступа к ошибкам с правильной типизацией
    const getRTUFieldError = (field: keyof RTUFormData): RTUFieldErrors[keyof RTUFormData] | undefined => {
        if (watchedConnectionType === 'RTU') {
            const rtuErrors = errors as RTUFieldErrors;
            return rtuErrors[field];
        }
        return undefined;
    };

    const getTCPFieldError = (field: keyof TCPFormData): TCPFieldErrors[keyof TCPFormData] | undefined => {
        if (watchedConnectionType === 'TCP') {
            const tcpErrors = errors as TCPFieldErrors;
            return tcpErrors[field];
        }
        return undefined;
    };

    const handleConnectionTypeChange = (newType: ConnectionType) => {
        setConnectionType(newType);
        setValue('connectionType', newType);
        if (newType === 'RTU') {
            reset({
                connectionType: 'RTU' as const,
                isActive: true,
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
            });
        } else {
            reset({
                connectionType: 'TCP' as const,
                isActive: true,
            });
        }
    };

    const onFormSubmit = (data: PortFormData) => {
        onSubmit(data as CreatePortData);
    };

    return (
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
                <>
                    <Input
                        label="COM порт"
                        {...register('port')}
                        error={!!getRTUFieldError('port')}
                        helperText={getRTUFieldError('port')?.message || 'Например: COM1, COM2'}
                        disabled={isLoading}
                    />
                    <div className={styles['form__row']}>
                        <Select
                            {...register('baudRate', { valueAsNumber: true })}
                            label="Скорость передачи"
                            defaultValue={9600}
                            error={!!getRTUFieldError('baudRate')}
                            helperText={getRTUFieldError('baudRate')?.message}
                            disabled={isLoading}
                        >
                            <MenuItem value={9600}>9600</MenuItem>
                            <MenuItem value={19200}>19200</MenuItem>
                            <MenuItem value={38400}>38400</MenuItem>
                            <MenuItem value={57600}>57600</MenuItem>
                            <MenuItem value={115200}>115200</MenuItem>
                        </Select>

                        <Select
                            {...register('dataBits', { valueAsNumber: true })}
                            label="Биты"
                            defaultValue={8}
                            error={!!getRTUFieldError('dataBits')}
                            helperText={getRTUFieldError('dataBits')?.message}
                            disabled={isLoading}
                        >
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                        </Select>
                    </div>

                    <div className={styles['form__row']}>
                        <Select
                            {...register('stopBits', { valueAsNumber: true })}
                            label="Стоп-биты"
                            defaultValue={1}
                            error={!!getRTUFieldError('stopBits')}
                            helperText={getRTUFieldError('stopBits')?.message}
                            disabled={isLoading}
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                        </Select>

                        <Select
                            {...register('parity')}
                            label="Четность"
                            defaultValue="none"
                            error={!!getRTUFieldError('parity')}
                            helperText={getRTUFieldError('parity')?.message}
                            disabled={isLoading}
                        >
                            <MenuItem value="none">Нет</MenuItem>
                            <MenuItem value="even">Четная</MenuItem>
                            <MenuItem value="odd">Нечетная</MenuItem>
                        </Select>
                    </div>


                </>
            ) : (
                <>
                    <Input
                        label="IP адрес или хост"
                        placeholder="192.168.1.1"
                        {...register('host')}
                        error={!!getTCPFieldError('host')}
                        helperText={getTCPFieldError('host')?.message}
                        disabled={isLoading}
                    />

                    <Input
                        label="TCP порт"
                        type="number"
                        placeholder="502"
                        {...register('tcpPort', { valueAsNumber: true })}
                        error={!!getTCPFieldError('tcpPort')}
                        helperText={getTCPFieldError('tcpPort')?.message || 'Стандартный Modbus TCP порт: 502'}
                        disabled={isLoading}
                    />
                </>
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
    );
};

