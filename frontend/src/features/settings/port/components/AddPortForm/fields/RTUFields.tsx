import { Input } from '@/shared/ui/Input/Input';
import { Select } from '@/shared/ui/Select/Select';
import { MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useGetAvailablePortsQuery } from '../../../api/portsApi';
import type { AvailablePorts } from '../../../types';
import type { PortFormData } from '../portSchemas';
import { getRTUFieldError } from '../utils/formUtils';
import styles from '../AddPortForm.module.scss';

interface RTUFieldsProps {
    isLoading?: boolean;
    errors: ReturnType<typeof useFormContext<PortFormData>>['formState']['errors'];
    watchedConnectionType: string;
}

export const RTUFields = ({ isLoading = false, errors, watchedConnectionType }: RTUFieldsProps) => {
    const { register } = useFormContext<PortFormData>();
    // Добавляем refetchOnMountOrArgChange для обновления при открытии модалки
    const { data: availablePorts = [], error: portsError } = useGetAvailablePortsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const portError = getRTUFieldError('port', watchedConnectionType, errors);

    const helperText = portError?.message ||
        (portsError
            ? 'Ошибка загрузки списка портов'
            : availablePorts.length > 0
                ? 'Выберите из списка или введите вручную (формат: COM1, COM2 и т.д.)'
                : 'Введите COM порт вручную (формат: COM1, COM2 и т.д.)');

    return (
        <>
            <div style={{ position: 'relative' }}>
                <Input
                    {...register('port')}
                    label="COM порт"
                    error={!!portError}
                    helperText={helperText}
                    disabled={isLoading}
                    placeholder="COM1"
                    inputProps={{
                        list: availablePorts.length > 0 ? 'available-ports-list' : undefined,
                    }}
                />
                {availablePorts.length > 0 && (
                    <datalist id="available-ports-list">
                        {availablePorts.map((port: AvailablePorts) => (
                            <option key={port.name} value={port.name} />
                        ))}
                    </datalist>
                )}
            </div>
            <div className={styles['form__row']}>
                <Select
                    {...register('baudRate', { valueAsNumber: true })}
                    label="Скорость передачи"
                    defaultValue={9600}
                    error={!!getRTUFieldError('baudRate', watchedConnectionType, errors)}
                    helperText={getRTUFieldError('baudRate', watchedConnectionType, errors)?.message}
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
                    error={!!getRTUFieldError('dataBits', watchedConnectionType, errors)}
                    helperText={getRTUFieldError('dataBits', watchedConnectionType, errors)?.message}
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
                    error={!!getRTUFieldError('stopBits', watchedConnectionType, errors)}
                    helperText={getRTUFieldError('stopBits', watchedConnectionType, errors)?.message}
                    disabled={isLoading}
                >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                </Select>

                <Select
                    {...register('parity')}
                    label="Четность"
                    defaultValue="none"
                    error={!!getRTUFieldError('parity', watchedConnectionType, errors)}
                    helperText={getRTUFieldError('parity', watchedConnectionType, errors)?.message}
                    disabled={isLoading}
                >
                    <MenuItem value="none">Нет</MenuItem>
                    <MenuItem value="even">Четная</MenuItem>
                    <MenuItem value="odd">Нечетная</MenuItem>
                </Select>
            </div>
        </>
    );
};

