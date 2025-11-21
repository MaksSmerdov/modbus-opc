import { Input } from '@/shared/ui/Input/Input';
import { Select } from '@/shared/ui/Select/Select';
import { MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useGetAvailablePortsQuery, useGetAvailablePortsSettingsQuery } from '../../../api/portsApi';
import type { AvailablePorts } from '../../../types';
import type { PortFormData } from '../portSchemas';
import { getRTUFieldError } from '../utils/formUtils';
import { useMemo } from 'react';
import styles from '../AddPortForm.module.scss';

interface RTUFieldsProps {
    isLoading?: boolean;
    errors: ReturnType<typeof useFormContext<PortFormData>>['formState']['errors'];
    watchedConnectionType: string;
}

interface PortOption {
    name: string;
    displayName: string;
}

export const RTUFields = ({ isLoading = false, errors, watchedConnectionType }: RTUFieldsProps) => {
    const { register } = useFormContext<PortFormData>();
    
    const { data: availablePorts = [], error: portsError } = useGetAvailablePortsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    
    const { data: portSettings = [] } = useGetAvailablePortsSettingsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    // Объединяем порты с настройками, фильтруем скрытые и форматируем отображение
    const portOptions = useMemo(() => {
        const settingsMap = new Map(portSettings.map(s => [s.portName, s]));
        const options: PortOption[] = [];

        availablePorts.forEach((port: AvailablePorts) => {
            const settings = settingsMap.get(port.name);
            
            // Пропускаем скрытые порты
            if (settings?.isHidden) {
                return;
            }

            // Форматируем отображение: "ПОРТ - ОПИСАНИЕ" или просто "ПОРТ"
            const displayName = settings?.description
                ? `${port.name} - ${settings.description}`
                : port.name;

            options.push({
                name: port.name,
                displayName,
            });
        });

        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [availablePorts, portSettings]);

    const portError = getRTUFieldError('port', watchedConnectionType, errors);

    const helperText = portError?.message ||
        (portsError
            ? 'Ошибка загрузки списка портов'
            : portOptions.length > 0
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
                        list: portOptions.length > 0 ? 'available-ports-list' : undefined,
                    }}
                />
                {portOptions.length > 0 && (
                    <datalist id="available-ports-list">
                        {portOptions.map((option) => (
                            <option key={option.name} value={option.name}>
                                {option.displayName}
                            </option>
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

