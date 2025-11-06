import { z } from 'zod';

// Схема валидации для RTU порта
export const rtuPortSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    connectionType: z.literal('RTU'),
    port: z.string().min(1, 'Порт обязателен'),
    baudRate: z.number().optional(),
    dataBits: z.number().optional(),
    stopBits: z.number().optional(),
    parity: z.string().optional(),
    isActive: z.boolean().optional(),
});

// Схема валидации для TCP порта
export const tcpPortSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    connectionType: z.literal('TCP'),
    host: z.string().min(1, 'Хост обязателен'),
    tcpPort: z.number().min(1, 'TCP порт обязателен').max(65535, 'TCP порт должен быть в диапазоне 1-65535'),
    isActive: z.boolean().optional(),
});

// Объединенная схема
export const portSchema = z.discriminatedUnion('connectionType', [rtuPortSchema, tcpPortSchema]);

export type PortFormData = z.infer<typeof portSchema>;

