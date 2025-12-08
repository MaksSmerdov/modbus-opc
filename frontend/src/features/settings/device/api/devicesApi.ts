import { baseApi } from '@/shared/api/baseApi';
import type {
    Device,
    DevicesListResponse,
    DeviceResponse,
    CreateDeviceData,
    UpdateDeviceData,
} from '@/features/settings/device/types';
import { normalizeDevicePortId, normalizeDevicesPortId } from '@/features/settings/device/utils/normalizeDevice';

export const devicesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получить список всех устройств
        getDevices: builder.query<Device[], void>({
            query: () => '/config/devices',
            providesTags: ['Devices'],
            transformResponse: (response: DevicesListResponse) => {
                return normalizeDevicesPortId(response.data);
            },
        }),

        // Получить устройство по ID
        getDevice: builder.query<Device, string>({
            query: (id) => `/config/devices/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Devices', id }],
            transformResponse: (response: DeviceResponse) => {
                return normalizeDevicePortId(response.data);
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
                return normalizeDevicePortId(response.data);
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
                return normalizeDevicePortId(response.data);
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