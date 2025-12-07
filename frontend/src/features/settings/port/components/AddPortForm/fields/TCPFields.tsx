import { Input } from '@/shared/ui/Input/Input';
import { useFormContext } from 'react-hook-form';
import type { PortFormData } from '@/features/settings/port/components/AddPortForm/portSchemas';
import { getTCPFieldError } from '@/features/settings/port/components/AddPortForm/utils/formUtils';

interface TCPFieldsProps {
    isLoading?: boolean;
    errors: ReturnType<typeof useFormContext<PortFormData>>['formState']['errors'];
    watchedConnectionType: string;
}

export const TCPFields = ({ isLoading = false, errors, watchedConnectionType }: TCPFieldsProps) => {
    const { register } = useFormContext<PortFormData>();

    return (
        <>
            <Input
                label="IP адрес или хост"
                placeholder="192.168.1.1"
                {...register('host')}
                error={!!getTCPFieldError('host', watchedConnectionType, errors)}
                helperText={getTCPFieldError('host', watchedConnectionType, errors)?.message}
                disabled={isLoading}
            />

            <Input
                label="TCP порт"
                type="number"
                placeholder="502"
                {...register('tcpPort', { valueAsNumber: true })}
                error={!!getTCPFieldError('tcpPort', watchedConnectionType, errors)}
                helperText={getTCPFieldError('tcpPort', watchedConnectionType, errors)?.message || 'Стандартный Modbus TCP порт: 502'}
                disabled={isLoading}
            />
        </>
    );
};

