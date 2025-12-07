import type { CreatePortData } from '@/features/settings/port/types';
import type { z } from 'zod';
import { rtuPortSchema, tcpPortSchema, type PortFormData } from '@/features/settings/port/components/AddPortForm/portSchemas';
import type { FieldErrors } from 'react-hook-form';

type RTUFormData = z.infer<typeof rtuPortSchema>;
type TCPFormData = z.infer<typeof tcpPortSchema>;
type RTUFieldErrors = FieldErrors<RTUFormData>;
type TCPFieldErrors = FieldErrors<TCPFormData>;

/**
 * Получает значения по умолчанию для формы порта
 */
export function getDefaultPortFormValues(initialData?: CreatePortData): Partial<PortFormData> {
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
}

/**
 * Получает значения для сброса формы при смене типа подключения на RTU
 */
export function getRTUResetValues(): Partial<PortFormData> {
    return {
        connectionType: 'RTU' as const,
        isActive: true,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
    };
}

/**
 * Получает значения для сброса формы при смене типа подключения на TCP
 */
export function getTCPResetValues(): Partial<PortFormData> {
    return {
        connectionType: 'TCP' as const,
        isActive: true,
    };
}

/**
 * Получает ошибку поля для RTU формы
 */
export function getRTUFieldError(
    field: keyof RTUFormData,
    connectionType: string,
    errors: FieldErrors<PortFormData>
): RTUFieldErrors[keyof RTUFormData] | undefined {
    if (connectionType === 'RTU') {
        const rtuErrors = errors as RTUFieldErrors;
        return rtuErrors[field];
    }
    return undefined;
}

/**
 * Получает ошибку поля для TCP формы
 */
export function getTCPFieldError(
    field: keyof TCPFormData,
    connectionType: string,
    errors: FieldErrors<PortFormData>
): TCPFieldErrors[keyof TCPFormData] | undefined {
    if (connectionType === 'TCP') {
        const tcpErrors = errors as TCPFieldErrors;
        return tcpErrors[field];
    }
    return undefined;
}

