import { baseApi } from '@/shared/api/baseApi';
import type {
    Device,
    DevicesListResponse,
    DeviceResponse,
    CreateDeviceData,
    UpdateDeviceData,
} from '../types';

export const devicesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получить список всех устройств
        getDevices: builder.query<Device[], void>({
            query: () => '/config/devices',
            providesTags: ['Devices'],
            transformResponse: (response: DevicesListResponse) => {
                // Нормализуем portId: если это объект, берем _id, иначе оставляем как есть
                return response.data.map((device) => ({
                    ...device,
                    portId: typeof device.portId === 'object' && device.portId !== null
                        ? (device.portId as { _id: string })._id
                        : device.portId,
                }));
            },
        }),

        // Получить устройство по ID
        getDevice: builder.query<Device, string>({
            query: (id) => `/config/devices/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Devices', id }],
            transformResponse: (response: DeviceResponse) => {
                // Нормализуем portId: если это объект, берем _id, иначе оставляем как есть
                const device = response.data;
                return {
                    ...device,
                    portId: typeof device.portId === 'object' && device.portId !== null
                        ? (device.portId as { _id: string })._id
                        : device.portId,
                };
            },
        }),

        // Создать новое устройство
        createDevice: builder.mutation<Device, CreateDeviceData>({
            query: (deviceData) => ({
                url: '/config/devices',
                method: 'POST',
                body: deviceData,
            }),
            transformResponse: (response: DeviceResponse) => {
                // Нормализуем portId: если это объект, берем _id, иначе оставляем как есть
                const device = response.data;
                return {
                    ...device,
                    portId: typeof device.portId === 'object' && device.portId !== null
                        ? (device.portId as { _id: string })._id
                        : device.portId,
                };
            },
            invalidatesTags: ['Devices'],
        }),

        // Обновить устройство
        updateDevice: builder.mutation<Device, { id: string; data: UpdateDeviceData }>({
            query: ({ id, data }) => ({
                url: `/config/devices/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: DeviceResponse) => {
                // Нормализуем portId: если это объект, берем _id, иначе оставляем как есть
                const device = response.data;
                return {
                    ...device,
                    portId: typeof device.portId === 'object' && device.portId !== null
                        ? (device.portId as { _id: string })._id
                        : device.portId,
                };
            },
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Devices', id },
                'Devices',
            ],
        }),

        // Удалить устройство
        deleteDevice: builder.mutation<{ success: true; message: string }, string>({
            query: (id) => ({
                url: `/config/devices/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Devices', id },
                'Devices',
            ],
        }),
    }),
});

export const {
    useGetDevicesQuery,
    useLazyGetDevicesQuery,
    useGetDeviceQuery,
    useLazyGetDeviceQuery,
    useCreateDeviceMutation,
    useUpdateDeviceMutation,
    useDeleteDeviceMutation,
} = devicesApi;