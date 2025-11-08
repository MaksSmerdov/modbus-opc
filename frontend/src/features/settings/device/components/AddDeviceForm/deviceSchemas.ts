import { z } from 'zod';

export const deviceSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    slug: z.string().regex(/^[a-z0-9-_]+$/, 'Slug может содержать только латинские буквы, цифры, дефисы и подчеркивания').optional(),
    slaveId: z.number().min(1, 'Slave ID должен быть от 1 до 247').max(247, 'Slave ID должен быть от 1 до 247'),
    portId: z.string().min(1, 'Порт обязателен'),
    timeout: z.number().min(500, 'Таймаут должен быть не менее 500мс').max(30000, 'Таймаут должен быть не более 30000мс').optional(),
    retries: z.number().min(1, 'Количество повторов должно быть от 1 до 15').max(15, 'Количество повторов должно быть от 1 до 15').optional(),
    saveInterval: z.number().min(5000, 'Интервал сохранения должен быть не менее 5000мс').optional(),
    logData: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type DeviceFormData = z.infer<typeof deviceSchema>;
